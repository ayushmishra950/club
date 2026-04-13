// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Separator } from "@/components/ui/separator";
// import { Switch } from "@/components/ui/switch";
// import {getAdmin} from "@/service/auth";
// import { useEffect } from "react";
// import { useToast } from "@/hooks/use-toast";
// import { useAppDispatch, useAppSelector } from "@/redux-toolkit/customHook/hook";
// import { setAdminData } from "@/redux-toolkit/slice/userSlice";

// export default function SettingsPage() {
//   const {toast} = useToast();
//   const dispatch = useAppDispatch();
//   const admin = useAppSelector((state)=> state?.user?.adminData);
//   const user = JSON.parse(localStorage.getItem("user"));
//   const handleSave = () => {};

//    const handleGetAdmin = async() => {
//     if(!user?._id) return;
//     try{
//       const res = await getAdmin(user?._id);
//       console.log(res);
//       if(res.status === 200){
//         dispatch(setAdminData(res?.data?.data))
//       }
//     }
//     catch(err){
//       console.log(err);
//     }
//    };

//    useEffect(()=>{
//       handleGetAdmin();
//    },[])

//   return (
//     <div className="space-y-6 max-w-3xl">
//       <Card className="shadow-card">
//         <CardHeader><CardTitle className="text-base font-display">Profile Settings</CardTitle></CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid sm:grid-cols-2 gap-4">
//             <div><label className="text-sm font-medium mb-1.5 block">Full Name</label><Input defaultValue="Rajesh Sharma" /></div>
//             <div><label className="text-sm font-medium mb-1.5 block">Email</label><Input defaultValue="rajesh@club.org" /></div>
//             <div><label className="text-sm font-medium mb-1.5 block">Phone</label><Input defaultValue="+91 98765 43210" /></div>
//             <div><label className="text-sm font-medium mb-1.5 block">Role</label><Input defaultValue="President" disabled /></div>
//           </div>
//           <Button onClick={handleSave} className="gradient-gold text-secondary-foreground font-semibold">Save Profile</Button>
//         </CardContent>
//       </Card>

//       <Card className="shadow-card">
//         <CardHeader><CardTitle className="text-base font-display">Club Settings</CardTitle></CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid sm:grid-cols-2 gap-4">
//             <div><label className="text-sm font-medium mb-1.5 block">Club Name</label><Input defaultValue="ClubConnect" /></div>
//             <div><label className="text-sm font-medium mb-1.5 block">Founded Year</label><Input defaultValue="2020" /></div>
//           </div>
//           <Button onClick={handleSave} className="gradient-gold text-secondary-foreground font-semibold">Save Settings</Button>
//         </CardContent>
//       </Card>

//       <Card className="shadow-card">
//         <CardHeader><CardTitle className="text-base font-display">Notifications</CardTitle></CardHeader>
//         <CardContent className="space-y-4">
//           {["Email Notifications", "Push Notifications", "Event Reminders", "Payment Alerts"].map((label) => (
//             <div key={label} className="flex items-center justify-between">
//               <span className="text-sm">{label}</span>
//               <Switch defaultChecked />
//             </div>
//           ))}
//         </CardContent>
//       </Card>

//       <Card className="shadow-card">
//         <CardHeader><CardTitle className="text-base font-display">Roles & Permissions</CardTitle></CardHeader>
//         <CardContent>
//           <div className="space-y-3">
//             {[
//               { role: "President", perms: "Full access to all modules" },
//               { role: "Secretary", perms: "Manage members, events, announcements" },
//               { role: "Treasurer", perms: "Finance, payments management" },
//               { role: "Member", perms: "View access, RSVP, polls" },
//             ].map((r) => (
//               <div key={r.role} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
//                 <span className="font-medium text-sm">{r.role}</span>
//                 <span className="text-xs text-muted-foreground">{r.perms}</span>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }




















import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

import { getAdmin, updateAdmin } from "@/service/auth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

import { useAppDispatch, useAppSelector } from "@/redux-toolkit/customHook/hook";
import { setAdminData } from "@/redux-toolkit/slice/userSlice";

export default function SettingsPage() {
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  const admin = useAppSelector((state) => state?.user?.adminData);
  const user = JSON.parse(localStorage.getItem("user"));

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    role: "",
    clubName: "",
    foundedYear: "",
  });

  // ✅ INPUT CHANGE HANDLER
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ GET ADMIN
  const handleGetAdmin = async () => {
    if (!user?._id) return;

    try {
      const res = await getAdmin(user?._id);

      if (res?.status === 200) {
        dispatch(setAdminData(res?.data?.data));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        role: formData.role,
        clubName: formData.clubName,
        foundedYear: formData.foundedYear,
      };

      const res = await updateAdmin(user?._id, payload);

      if (res?.status === 200) {
        toast({
          title: "Success",
          description: "Settings updated successfully",
        });

        dispatch(setAdminData(res?.data?.data));
      }
    } catch (err) {
      console.log(err);

      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  // ✅ INITIAL LOAD
  useEffect(() => {
    handleGetAdmin();
  }, []);

  // ✅ SYNC ADMIN → FORM
  useEffect(() => {
    if (admin) {
      setFormData({
        name: admin?.name || "",
        email: admin?.email || "",
        mobile: admin?.mobile || "",
        role: admin?.role || "",
        clubName: admin?.clubName || "",
        foundedYear: admin?.foundedYear || "",
      });
    }
  }, [admin]);

  return (
    <div className="space-y-6 max-w-3xl">

      {/* PROFILE */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base font-display">
            Profile Settings
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Full Name
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Email
              </label>
              <Input
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Phone
              </label>
              <Input
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Role
              </label>
              <Input
                name="role"
                value={formData.role}
                disabled
              />
            </div>

          </div>

          <Button
            onClick={handleSave}
            className="gradient-gold text-secondary-foreground font-semibold"
          >
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* CLUB */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base font-display">
            Club Settings
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Club Name
              </label>
              <Input
                name="clubName"
                value={formData.clubName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Founded Year
              </label>
              <Input
                name="foundedYear"
                value={formData.foundedYear}
                onChange={handleChange}
              />
            </div>

          </div>

          <Button
            onClick={handleSave}
            className="gradient-gold text-secondary-foreground font-semibold"
          >
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* NOTIFICATIONS (unchanged UI) */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base font-display">
            Notifications
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {[
            "Email Notifications",
            "Push Notifications",
            "Event Reminders",
            "Payment Alerts",
          ].map((label) => (
            <div
              key={label}
              className="flex items-center justify-between"
            >
              <span className="text-sm">{label}</span>
              <Switch defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  );
}
