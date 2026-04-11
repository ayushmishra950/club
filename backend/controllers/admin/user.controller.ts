import Admin from "../../models/admin.model.js";
import User from "../../models/user.model.js";
import type { Request, Response } from "express";


export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // query parameters
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
    console.error(err);
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
  catch (err) {
    return res.status(500).json({ message: err })
  }
};






export const handleVerifyBusinessUser = async (req: Request, res: Response) => {
  try {
    const {userId, val} = req.body;
    if (!userId) return res.status(400).json({ message: "userId not found." });

    const user = await User.findOne({ _id: userId });
    if (!user) return res.status(404).json({ message: "user not Found." });

    user.businessVerified = val;

    await user.save();
    res.status(200).json({ message: `business ${val? "varified" : "Unverified"} successfully.` })
  }
  catch (err) {
    return res.status(500).json({ message: err })
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
  catch (err) {
    res.status(500).json({ message: err })
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
  catch (err) {
    res.status(500).json({ message: err })
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