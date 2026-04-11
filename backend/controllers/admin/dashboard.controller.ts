import User from "../../models/user.model.js";
import Donation from "../../models/donate.model.js";
import Event from "../../models/event.model.js";
import type {Request, Response} from "express";


export const dashboardSummary = async (req: Request, res: Response) => {
  try {
    // 1️⃣ Total users & events
    const totalUser = await User.countDocuments();
    const totalEvent = await Event.countDocuments();

    // 2️⃣ Total donations
    const totalDonationResult = await Donation.aggregate([
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
    ]);
    const totalDonation = totalDonationResult[0]?.totalAmount || 0;

    // 3️⃣ Current month range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // 4️⃣ Current month new users percentage
    const currentMonthUserCount = await User.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });
    const userPercentage = totalUser
      ? Math.round((currentMonthUserCount / totalUser) * 100)
      : 0;

    // 5️⃣ Current month donation total amount
    const currentMonthDonationResult = await Donation.aggregate([
      { $match: { createdAt: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
    ]);
    const currentMonthDonation = currentMonthDonationResult[0]?.totalAmount || 0;

    // 6️⃣ Current month donation percentage
    const donationPercentage = totalDonation
      ? Math.round((currentMonthDonation / totalDonation) * 100)
      : 0;

    // 7️⃣ Current month events count
    const currentMonthEventCount = await Event.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // 8️⃣ Send response
    return res.status(200).json({
      totalUser,
      userPercentage,            
      totalDonation,
      currentMonthDonation,     
      donationPercentage,     
      totalEvent,
      currentMonthEventCount    
    });

  } catch (err: unknown) {
    if (err instanceof Error) return res.status(500).json({ message: err.message });
    return res.status(500).json({ message: "Unknown error" });
  }
};



export const getMonthlyDonationSummary = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();

    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    // 1️⃣ Aggregate donations for current year
    const result = await Donation.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, 0, 1), // Jan 1 current year
            $lte: new Date(currentYear, 11, 31, 23, 59, 59, 999) // Dec 31 current year
          }
        }
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          totalAmount: { $sum: "$amount" },
        }
      }
    ]);

    // 2️⃣ Create a map of month => totalAmount
    const monthMap: { [key: number]: number } = {};
    result.forEach(item => {
      monthMap[item._id.month] = item.totalAmount;
    });

    // 3️⃣ Prepare final array for all 12 months
    const monthlyArray = months.map((name, index) => ({
      month: name,
      totalAmount: monthMap[index + 1] ?? 0,
      year: currentYear
    }));

    res.status(200).json({ monthlyArray });

  } catch (err: unknown) {
    if (err instanceof Error) return res.status(500).json({ message: err.message });
    return res.status(500).json({ message: "Unknown error" });
  }
};