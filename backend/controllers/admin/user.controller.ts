import Admin from "../../models/admin.model.js";
import User from "../../models/user.model.js";
import type { Request, Response } from "express";
import { nanoid } from "nanoid";
import xlsx from "xlsx";
import { getIO } from "../../utils/socketHelper.js";


export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const pageParam = req.query.page;
    const perPageParam = req.query.perPage;
    const searchParam = req.query.search;

    const page = parseInt(typeof pageParam === "string" ? pageParam : "1", 10);
    const perPage = parseInt(typeof perPageParam === "string" ? perPageParam : "8", 10);
    const search = typeof searchParam === "string" ? searchParam.trim() : "";

    // search filter
    let filter = {};
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

    const users = await User.find(filter).populate({ path: "donations" })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 }); // latest first


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
    const userId = req.params?.id;
    if (!userId) return res.status(400).json({ message: "userId not found." });

    const user = await User.findOne({ _id: userId });
    if (!user) return res.status(404).json({ message: "user not Found." });

    user.isVerified = true;

    await user.save();
    res.status(200).json({ message: "User verified successfully." })
  }
  catch (err: any) {
    return res.status(500).json({ message: err?.message || "Server Error" })
  }
};




export const handleVerifyBusinessUser = async (req: Request, res: Response) => {
  try {
    const { userId, val } = req.body;
    if (!userId) return res.status(400).json({ message: "userId not found." });

    const user = await User.findOne({ _id: userId });
    if (!user) return res.status(404).json({ message: "user not Found." });

    user.businessVerified = val;

    await user.save();
    res.status(200).json({ message: `business ${val ? "varified" : "Unverified"} successfully.` })
  }
  catch (err: any) {
    return res.status(500).json({ message: err?.message || "Server Error" })
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




// export const uploadExcel = async (req: Request, res: Response) => {
//   try {
//     const files = req.files as any;
//     const file = files?.excelFile?.[0];

//     if (!file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     // Read Excel file
//     const workbook = xlsx.read(file.buffer, { type: "buffer" });

//     const sheetName = workbook.SheetNames[0];
//     const sheetData = workbook.Sheets[sheetName];

//     const jsonData = xlsx.utils.sheet_to_json(sheetData);
//     console.log("jsonData", jsonData);

//     // Save to MongoDB
//     await User.insertMany(jsonData);

//     res.status(201).json({
//       message: "Excel uploaded and data saved successfully",
//       totalInserted: jsonData.length,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };



// export const uploadExcel = async (req: Request, res: Response) => {
//   try {
//     const files = req.files as any;
//     const file = files?.excelFile?.[0];

//     if (!file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     const workbook = xlsx.read(file.buffer, { type: "buffer" });
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const jsonData: any[] = xlsx.utils.sheet_to_json(sheet);

//     // ✅ Add userId to each user
//     const usersWithId = jsonData.map((user, index) => ({
//       ...user,
//       userId: `USR-${nanoid(8)}`,

//       // ⚠️ important: phone string me convert karo
//       phone: user.phone?.toString(),

//       // ⚠️ Excel date fix
//       dob: typeof user.dob === "number"
//         ? new Date(xlsx.SSF.parse_date_code(user.dob).y,
//                    xlsx.SSF.parse_date_code(user.dob).m - 1,
//                    xlsx.SSF.parse_date_code(user.dob).d)
//         : user.dob,
//     }));

//     // Save to MongoDB
//     const result = await User.insertMany(usersWithId, {
//       ordered: false,
//     });

//     res.status(201).json({
//       message: "Excel uploaded and users saved successfully",
//       data: result,
//     });

//   } catch (error: any) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };


export const uploadExcel = async (req: Request, res: Response) => {
  try {
    const files = req.files as any;
    const file = files?.excelFile?.[0];

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = xlsx.read(file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData: any[] = xlsx.utils.sheet_to_json(sheet);

    const successUsers: any[] = [];
    const duplicateUsers: any[] = [];

    for (const user of jsonData) {

      const email = user.email;
      const phone = user.phone?.toString();

      const existing = await User.findOne({
        $or: [{ email }, { phone }]
      });

      if (existing) {
        duplicateUsers.push({
          fullName: user.fullName,
          email,
          phone,
          reason:
            existing.email === email && existing.phone === phone
              ? "Email & Phone already exists"
              : existing.email === email
              ? "Email already exists"
              : "Phone already exists"
        });
        continue;
      }

      successUsers.push({
        ...user,
        userId: `USR-${nanoid(8)}`,
        phone,
        dob:
          typeof user.dob === "number"
            ? new Date(
                xlsx.SSF.parse_date_code(user.dob).y,
                xlsx.SSF.parse_date_code(user.dob).m - 1,
                xlsx.SSF.parse_date_code(user.dob).d
              )
            : user.dob,
      });
    }

    const result = await User.insertMany(successUsers);

    return res.status(201).json({
      message: "Excel upload completed",
      insertedCount: result.length,
      duplicateCount: duplicateUsers.length,
      duplicates: duplicateUsers, // 👈 important for admin
      inserted: result,
    });

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: error.message
    });
  }
};


export const acceptPaymentRequest = async(req:Request, res:Response) => {
  try{
    const userId = req.params.id;
    console.log("userId", userId);
    const io = getIO();
    if(!userId) return res.status(400).json({ message: "userId not found." });

    const user = await User.findById(userId);
    if(!user) return res.status(404).json({ message: "user not found." });
    user.premiumUser = "premium";
    await user.save();
    io.to(userId.toString()).emit("paymentRequestAccepted", { userId });
    res.status(200).json({user:user, message: "Payment request accepted and user upgraded to premium successfully." })
  }
  catch(err:any){
    res.status(500).json({ message: err?.message || "Server Error" })
  }
}