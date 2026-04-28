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



export const addNewUser = async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !phone || !password) return res.status(400).json({ message: "All fields are required." });
    const user = await User.findOne({ email, phone });
    if (user) return res.status(400).json({ message: "User already exists." });
    const userId = `USR-${nanoid(8)}`;

    const newUser = await User.create({ fullName, email, phone, password, userId });
    res.status(201).json({ message: "New Member added successfully.", data: newUser });
  }
  catch (err: any) {
    res.status(500).json({ message: err?.message || "Server Error" })
  }
}


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
}


const normalize = (val: string) => val?.trim().toLowerCase();

const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 10);
};

const buildUser = async (user: any, extra: any = {}) => {
  const rawPassword =
    user.password || `${user?.fullName?.trim()?.toLowerCase()}@123`;

  const hashedPassword = await hashPassword(rawPassword);

  return {
    fullName: user.fullName,
    email: normalize(user.email),
    ...(user.phone && { phone: user.phone.toString() }),
    password: hashedPassword,
    userId: `USR-${nanoid(8)}`,
    dob: user.dob || null,
    spouseName: extra.spouseName || null,
    spouseEmail: extra.spouseEmail
      ? normalize(extra.spouseEmail)
      : null,
  };
};

export const uploadExcel = async (req: Request, res: Response) => {
  try {
    const file = (req.files as any)?.excelFile?.[0];

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = xlsx.read(file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData: any[] = xlsx.utils.sheet_to_json(sheet);

    const successUsers: any[] = [];
    const duplicateUsers: any[] = [];

    // 🔹 Normalize all emails/phones from Excel
    const emails = jsonData
      .flatMap(u => [u.email, u.spouseEmail])
      .filter(Boolean)
      .map(normalize);

    const phones = jsonData
      .flatMap(u => [u.phone])
      .filter(Boolean)
      .map(p => p.toString());

    // 🔹 Existing users from DB
    const existingUsers = await User.find({
      $or: [
        { email: { $in: emails } },
        { phone: { $in: phones } }
      ]
    });

    const existingEmailSet = new Set(
      existingUsers.map(u => normalize(u.email))
    );

    const existingPhoneSet = new Set(
      existingUsers.map(u => u.phone)
    );

    // 🔹 Excel-level tracking
    const usedEmails = new Set<string>();
    const usedPhones = new Set<string>();

    for (const user of jsonData) {
      const email = normalize(user.email);
      const phone = user.phone ? user.phone.toString() : null;

      // =========================
      // 👤 MAIN USER CHECK
      // =========================
      if (existingEmailSet.has(email) || usedEmails.has(email) || (phone && (existingPhoneSet.has(phone) || usedPhones.has(phone)))) {
        duplicateUsers.push({ email, phone, reason: "Main user duplicate" });
        continue;
      }

      usedEmails.add(email);
      if (phone) usedPhones.add(phone);

      const mainUser = await buildUser(user);
      successUsers.push(mainUser);

      // =========================
      // 🔗 SPOUSE USER CHECK
      // =========================
      if (user.spouseEmail && user.spouseName) {
        const spouseEmail = normalize(user.spouseEmail);
        if (
          existingEmailSet.has(spouseEmail) ||
          usedEmails.has(spouseEmail)
        ) {
          duplicateUsers.push({
            email: spouseEmail,
            reason: "Spouse email duplicate"
          });
          continue;
        }

        usedEmails.add(spouseEmail);

        const spouseUser = await buildUser(
          {
            fullName: user.spouseName,
            email: spouseEmail,
            phone: null,
            password: user.password
          },
          {
            spouseName: user.fullName,
            spouseEmail: email
          }
        );

        successUsers.push(spouseUser);
      }
    }

    const result = await User.insertMany(successUsers);

    return res.status(201).json({
      message: "Excel upload completed successfully",
      insertedCount: result.length,
      duplicateCount: duplicateUsers.length,
      duplicates: duplicateUsers,
      inserted: result
    });

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: error.message
    });
  }
};