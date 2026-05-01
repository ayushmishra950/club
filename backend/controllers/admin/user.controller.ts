import Admin from "../../models/admin.model.js";
import User from "../../models/user.model.js";
import type { Request, Response } from "express";
import { nanoid } from "nanoid";
import xlsx from "xlsx";
import { getIO } from "../../utils/socketHelper.js";
import bcrypt from "bcryptjs";


export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const pageParam = req.query.page;
    const perPageParam = req.query.perPage;
    const searchParam = req.query.search;
    const status = req.query.filterStatus;

    const page = parseInt(typeof pageParam === "string" ? pageParam : "1", 10);
    const perPage = parseInt(typeof perPageParam === "string" ? perPageParam : "8", 10);
    const search = typeof searchParam === "string" ? searchParam.trim() : "";

    // search filter
    let filter: any = {};
    if (status) {
      filter.blocked = status === "active" ? false : true;
    }
    if (search) {
      filter = {
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } }
        ]
      };
    }

    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });


    res.status(200).json({
      users,
      total,
      page,
      perPage,
      success: true
    });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || "Server Error" });
  }
};


export const handleVerifyUser = async (req: Request, res: Response) => {
  try {
    const { memberIds } = req.body;

    if (!memberIds || memberIds.length === 0) {
      return res.status(400).json({ message: "memberIds not found." });
    }

    await User.updateMany(
      { _id: { $in: memberIds } },
      { $set: { isVerified: true } }
    );

    return res.status(200).json({
      message: "Users verified successfully."
    });

  } catch (err: any) {
    return res.status(500).json({
      message: err?.message || "Server Error"
    });
  }
};




export const handleVerifyBusinessUser = async (req: Request, res: Response) => {
  try {
    const { userId, businessId, status } = req.body;
    if (!userId || !businessId) {
      return res.status(400).json({ success: false, message: "userId and businessId are required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Find the business in the businesses array
    const business = user.businesses.find(b => b.businessId === businessId);
    if (!business) {
      return res.status(404).json({ success: false, message: "Business not found." });
    }

    // Update status: true maps to 'verified', false maps to 'rejected'
    business.isVerified = status === true ? "verified" : "rejected";

    await user.save();
    res.status(200).json({
      success: true,
      message: `Business ${status === true ? "Verified" : "Rejected"} successfully.`,
      user
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || "Server Error" });
  }
};


export const handleBlockAndUnBlockUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    if (!userId) return res.status(400).json({ message: "userId not Found." });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "user not found." });

    user.blocked = !user?.blocked;
    await user?.save();

    res.status(200).json({ message: `User ${user.blocked ? "Blocked" : "Unblocked"} successfully.` })
  }
  catch (err: any) {
    res.status(500).json({ message: err?.message || "Server Error" })
  }
};


export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    if (!userId) return res.status(400).json({ message: "userId not found." });

    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: "user not Found." });

    res.status(200).json({ message: "user deleted Successfully." })

  }
  catch (err: any) {
    res.status(500).json({ message: err?.message || "Server Error" })
  }
};

export const roleAssignUser = async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ message: "UserId and role are required." });
    }

    const allowedRoles = ["user", "secretary", "treasurer"];

    if (!allowedRoles.includes(role.toLowerCase())) {
      return res.status(400).json({ message: "Invalid role provided." });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role: role.toLowerCase() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: `${user.fullName}'s role has been updated to ${user.role}.`
    });

  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};


export const activeAndInactiveUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;
    if (!userId) return res.status(400).json({ message: "userId not found." });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "user not found." });

    user.blocked = status;
    await user?.save();

    res.status(200).json({ message: `${status === true ? "User Blocked" : "User UnBlocked"} Successfully.` })
  }
  catch (err: any) {
    res.status(500).json({ message: err?.message || "Server Error" })
  }
};

export const acceptPaymentRequest = async (req: Request, res: Response) => {
  try {
    const { id, amount } = req.body;

    const io = getIO();
    if (!id) return res.status(400).json({ message: "userId not found." });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "user not found." });
    user.premiumUser = "premium";
    user.amount = amount;

    await user.save();
    io.to(user?._id?.toString()).emit("paymentRequestAccepted", { user });
    io.emit("paymentSuccess");
    res.status(200).json({ user: user, message: "Payment request accepted and user upgraded to premium successfully." })
  }
  catch (err: any) {
    res.status(500).json({ message: err?.message || "Server Error" })
  }
};














//   const normalize = (val?: string) => val?.trim().toLowerCase();

// const parseChildren = (children: any) => {
//   try {
//     if (!children) return [];
//     const parsed =
//       typeof children === "string" ? JSON.parse(children) : children;
//     return Array.isArray(parsed) ? parsed : [];
//   } catch {
//     return [];
//   }
// };

// export const uploadExcel = async (req: Request, res: Response) => {
//   try {
//     const file = (req.files as any)?.excelFile?.[0];

//     if (!file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     const workbook = xlsx.read(file.buffer, { type: "buffer" });
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const rows: any[] = xlsx.utils.sheet_to_json(sheet);

//     const successUsers: any[] = [];
//     const duplicateUsers: any[] = [];

//     const { nanoid } = await import("nanoid");

//     // ===== Collect emails & phones =====
//     const allEmails = rows
//       .flatMap(r => [r.email, r.wifeEmail])
//       .filter(Boolean)
//       .map(normalize);

//     const allPhones = rows
//       .flatMap(r => [r.mobile, r.wifeMobile])
//       .filter(Boolean)
//       .map(p => p.toString());

//       console.log("All Emails from Excel:", allEmails);
//       console.log("All Phones from Excel:", allPhones);

//     const existingUsers = await User.find({
//       $or: [
//         { "personalDetails.email": { $in: allEmails } },
//         { "personalDetails.mobile": { $in: allPhones } }
//       ]
//     });

//     const existingEmailSet = new Set(
//       existingUsers.map(u => normalize(u.personalDetails?.email)).filter(Boolean)
//     );

//     const existingPhoneSet = new Set(
//       existingUsers.map(u => u.personalDetails?.mobile?.toString()).filter(Boolean)
//     );

//     const usedEmails = new Set<string>();
//     const usedPhones = new Set<string>();

//     // ================= PROCESS =================
//     for (const row of rows) {
//       const userEmail = normalize(row.email);
//       const wifeEmail = normalize(row.wifeEmail);

//       const userPhone = row.mobile?.toString();
//       const wifePhone = row.wifeMobile?.toString();

//       const relationId = nanoid(10);

//       // ❌ Same row validation
//       if (
//         userEmail &&
//         wifeEmail &&
//         userEmail === wifeEmail
//       ) {
//         duplicateUsers.push({
//           email: userEmail,
//           reason: "User & Wife email same"
//         });
//         continue;
//       }

//       if (
//         userPhone &&
//         wifePhone &&
//         userPhone === wifePhone
//       ) {
//         duplicateUsers.push({
//           phone: userPhone,
//           reason: "User & Wife mobile same"
//         });
//         continue;
//       }

//       // ===== MAIN USER =====
//       if (!userEmail) {
//         duplicateUsers.push({ reason: "User email missing" });
//         continue;
//       }

//       const isUserDuplicate =
//         existingEmailSet.has(userEmail) ||
//         usedEmails.has(userEmail) ||
//         (userPhone &&
//           (existingPhoneSet.has(userPhone) || usedPhones.has(userPhone)));

//       if (!isUserDuplicate) {
//         usedEmails.add(userEmail);
//         if (userPhone) usedPhones.add(userPhone);

//         successUsers.push({
//           userId: `USR-${nanoid(8)}`,
//           password: `${row.fullName?.trim()?.toLowerCase() || "user"}@123`,
//           relationId,

//           personalDetails: {
//             fullName: row.fullName,
//             email: userEmail,
//             ...(userPhone && { mobile: userPhone }),

//             ...(row.wifeName && { wifeName: row.wifeName }),
//             ...(wifeEmail && { wifeEmail }),

//             ...(row.address && { address: row.address }),
//             ...(row.state && { state: row.state }),
//             ...(row.country && { country: row.country }),

//             children: parseChildren(row.children)
//           }
//         });

//       } else {
//         duplicateUsers.push({
//           email: userEmail,
//           phone: userPhone,
//           reason: "User duplicate"
//         });
//       }

//       // ===== WIFE USER =====
//       if (wifeEmail && row.wifeName) {
//         const isWifeDuplicate =
//           existingEmailSet.has(wifeEmail) ||
//           usedEmails.has(wifeEmail) ||
//           (wifePhone &&
//             (existingPhoneSet.has(wifePhone) || usedPhones.has(wifePhone)));

//         if (!isWifeDuplicate) {
//           usedEmails.add(wifeEmail);
//           if (wifePhone) usedPhones.add(wifePhone);

//           successUsers.push({
//             userId: `USR-${nanoid(8)}`,
//             password: `${row.wifeName?.trim()?.toLowerCase() || "user"}@123`,
//             relationId,

//             personalDetails: {
//               fullName: row.wifeName,
//               email: wifeEmail,
//               ...(wifePhone && { mobile: wifePhone }),

//               wifeName: row.fullName,
//               wifeEmail: userEmail,

//               ...(row.address && { address: row.address }),
//               ...(row.state && { state: row.state }),
//               ...(row.country && { country: row.country }),

//               children: []
//             }
//           });

//         } else {
//           duplicateUsers.push({
//             email: wifeEmail,
//             phone: wifePhone,
//             reason: "Wife duplicate"
//           });
//         }
//       }
//     }

//     // ===== INSERT =====
//     if (!successUsers.length) {
//       return res.json({
//         message: "No users inserted",
//         insertedCount: 0,
//         duplicateCount: duplicateUsers.length,
//         duplicates: duplicateUsers
//       });
//     }

//     const inserted = await User.insertMany(successUsers, {
//       ordered: false
//     });

//     return res.status(201).json({
//       message: "Upload successful",
//       insertedCount: inserted.length,
//       duplicateCount: duplicateUsers.length,
//       duplicates: duplicateUsers,
//       inserted: inserted
//     });

//   } catch (err: any) {
//     console.error(err);
//     return res.status(500).json({
//       message: err.message || "Upload failed"
//     });
//   }
// };


















const generatePasswordFromName = (fullName: string) => {
  if (!fullName) return "";

  const firstName = fullName.trim().split(" ")[0].toLowerCase() || "user";

  const rawPassword = `${firstName}@123`;

  const hashedPassword = bcrypt.hashSync(rawPassword, 10);

  return hashedPassword;
};


  const normalize = (val?: string) => val?.trim().toLowerCase();

const parseExcelChildren = (row: any) => {
  const children = [];

  for (let i = 1; i <= 10; i++) {
    const name = row[`kid${i}name`];
    const age = row[`kid${i}age`];

    if (name && age) {
      children.push({
        name: name.toString().trim(),
        age: Number(age)
      });
    }
  }

  return children;
};
export const uploadExcel = async (req: Request, res: Response) => {
  try {
    const file = (req.files as any)?.excelFile?.[0];
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = xlsx.read(file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = xlsx.utils.sheet_to_json(sheet);

    const successUsers: any[] = [];
    const duplicateUsers: any[] = [];

    const { nanoid } = await import("nanoid");

    // ===== Collect emails & phones =====
    const allEmails = rows
      .flatMap(r => [r.email, r.wifeEmail])
      .filter(Boolean)
      .map(normalize);

    const allPhones = rows
      .flatMap(r => [r.mobile, r.wifeMobile])
      .filter(Boolean)
      .map(p => p?.toString());

    // ===== existing DB users =====
    const existingUsers = await User.find({
      $or: [
        { "email": { $in: allEmails } },
        { "mobile": { $in: allPhones } }
      ]
    });

    const existingEmailSet = new Set(
      existingUsers.map(u => normalize(u.email)).filter(Boolean)
    );

    const existingPhoneSet = new Set(
      existingUsers.map(u => u.mobile?.toString()).filter(Boolean)
    );

    const usedEmails = new Set<string>();
    const usedPhones = new Set<string>();

    // ================= PROCESS =================
    for (const row of rows) {
      const userEmail = normalize(row.email);
      const wifeEmail = normalize(row.wifeEmail);

      const userPhone = row.mobile?.toString();
      const wifePhone = row.wifeMobile?.toString();

      const relationId = nanoid(10);

      if (!userEmail) {
        duplicateUsers.push({ reason: "User email missing" });
        continue;
      }

      // ❌ same row validation
      if (userEmail && wifeEmail && userEmail === wifeEmail) {
        duplicateUsers.push({ email: userEmail, reason: "Same email in row" });
        continue;
      }

      if (userPhone && wifePhone && userPhone === wifePhone) {
        duplicateUsers.push({ phone: userPhone, reason: "Same phone in row" });
        continue;
      }

      // ================= MAIN USER =================
      const isUserDuplicate =
        existingEmailSet.has(userEmail) ||
        usedEmails.has(userEmail) ||
        (userPhone && (existingPhoneSet.has(userPhone) || usedPhones.has(userPhone)));

      if (!isUserDuplicate) {
        usedEmails.add(userEmail);
        if (userPhone) usedPhones.add(userPhone);

        successUsers.push({
          userId: row?.userId?.toString() || `USR-${nanoid(8)}`,
          password: generatePasswordFromName(row.fullName),
          relationId,

          fullName: row.fullName,
          email: userEmail,
          mobile: userPhone || undefined,
          dob: row.dob ? new Date(row.dob) : undefined,
          occupation: row.occupation || undefined,
          wifeName: row.wifeName || undefined,
          wifeEmail: wifeEmail || undefined,
          wifeOccupation: row.wifeOccupation || undefined,
          wifeDob: row.wifeDob ? new Date(row.wifeDob) : undefined,
          wifeMobile: wifePhone || undefined,
          address: row.address,
          state: row.state,
          country: row.country,
          anniversaryDate: row.anniversaryDate ? new Date(row.anniversaryDate) : undefined,
          children: parseExcelChildren(row)
        });
      } else {
        duplicateUsers.push({ email: userEmail, reason: "User duplicate" });
      }

      // ================= WIFE USER =================
      if (wifeEmail && row.wifeName) {
        const isWifeDuplicate =
          existingEmailSet.has(wifeEmail) ||
          usedEmails.has(wifeEmail) ||
          (wifePhone && (existingPhoneSet.has(wifePhone) || usedPhones.has(wifePhone)));

        if (!isWifeDuplicate) {
          usedEmails.add(wifeEmail);
          if (wifePhone) usedPhones.add(wifePhone);

          successUsers.push({
            userId: row?.wifeUserId?.toString() || `USR-${nanoid(8)}`,
            password: generatePasswordFromName(row.wifeName),
            relationId,

            fullName: row.wifeName,
            email: wifeEmail,
            mobile: wifePhone || undefined,
            dob: row.wifeDob ? new Date(row.wifeDob) : undefined,
            occupation: row.wifeOccupation || undefined,
            wifeName: row.fullName,
            wifeEmail: userEmail,
            wifeOccupation: row.wifeOccupation || undefined,
            wifeDob: row.wifeDob ? new Date(row.wifeDob) : undefined,
            wifeMobile: wifePhone || undefined,
            address: row.address,
            state: row.state,
            country: row.country,
            anniversaryDate: row.anniversaryDate ? new Date(row.anniversaryDate) : undefined,
            children: parseExcelChildren(row)
          });
        } else {
          duplicateUsers.push({ email: wifeEmail, reason: "Wife duplicate" });
        }
      }
    }

    // ================= INSERT =================
    if (!successUsers.length) {
      return res.json({
        message: "No users inserted",
        insertedCount: 0,
        duplicateCount: duplicateUsers.length,
        duplicates: duplicateUsers
      });
    }

    const inserted = await User.insertMany(successUsers, { ordered: false });

    return res.status(201).json({
      message: "Upload successful",
      insertedCount: inserted.length,
      duplicateCount: duplicateUsers.length,
      duplicates: duplicateUsers,
      inserted
    });

  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      message: err.message || "Upload failed"
    });
  }
};