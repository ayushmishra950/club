import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Calendar, MapPin, Users, Clock, Edit, Delete, Trash, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import socket from "@/socket/socket";
import { getAllUser, verifyBusinessUser } from "@/service/auth";
import { setBusinessList } from "@/redux-toolkit/slice/userSlice";
import { useAppDispatch, useAppSelector } from "@/redux-toolkit/customHook/hook";


export default function BusinessDirectoryPage() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);
  const [search, setSearch] = useState("");
  const dispatch = useAppDispatch();
  const users = useAppSelector((state) => state?.user?.businessList);


  useEffect(() => {
  const handler = () => {
    handleGetAllUser();
  };

  socket.on("updateProfileFromUser", handler);

  return () => {
    socket.off("updateProfileFromUser", handler);
  };
}, []);

  const handleGetAllUser = async () => {
    try {
      const res = await getAllUser({ page, perPage, search });
      if (res.status === 200) {
        const businessUsers = res?.data?.users?.filter(user => user.accountType === "business");
        dispatch(setBusinessList(businessUsers))
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleVerifyBusiness = async (userId: string, val: boolean) => {
    if (!userId) return;
    try {
      let obj = { userId: userId, val: val };
      const res = await verifyBusinessUser(obj);
      if (res.status === 200) {
        toast({ title: "business Verify Successfully.", description: res?.data?.message });
        handleGetAllUser();
        socket.emit("businessVerify", userId);
      }
    }
    catch (err) {
      console.log(err);
      toast({ title: "business verify failed.", description: err?.response?.data?.message || err?.message, variant: "destructive" })
    }
  }

  useEffect(() => {
    if (users?.length === 0) {
      handleGetAllUser();
    }
  }, [users?.length]);  

  return (
    <>
      <div className="space-y-4 ">
        <div className="flex justify-between items-center">
          <h3 className="font-display font-semibold text-lg">All Business Groups</h3>
        </div>

        {Array.isArray(users) && users.length > 0  ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users?.map((user) => (
              <Card
                key={user?._id}
                className="shadow-card hover:shadow-elevated transition-shadow relative"
              >
                {user.businessCoverImage && (
                  <img
                    src={user?.businessCoverImage}
                    alt={user?.businessName}
                    className="w-full h-48 object-cover rounded-t"
                  />
                )}

                <CardContent className="p-5">

                  <h3 className="font-display font-semibold text-lg mb-2">
                    {user?.businessName}
                  </h3>

                  <p className="text-sm text-muted-foreground mb-4">
                    {user?.businessDescription}
                  </p>

                  <div className="space-y-2 text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-secondary" />
                      {new Date(user.createdAt)?.toLocaleDateString()}
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-secondary" />
                      {user.businessAddress}
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-secondary" />
                      {user?.members?.length} Members
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-secondary" />
                      createdBy:- {user?.fullName}
                    </div>
                  </div>

                  {user?.businessVerified === null && (
                    <div className="flex items-center justify-end gap-3 mt-3">

                      <button
                        className="h-8 w-8 rounded-full flex items-center justify-center bg-green-100 text-green-600 hover:bg-green-200 transition"
                        title="Verify"
                        onClick={() => handleVerifyBusiness(user._id, true)}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        className="h-8 w-8 rounded-full flex items-center justify-center bg-red-100 text-red-600 hover:bg-red-200 transition"
                        title="Reject"
                        onClick={() => handleVerifyBusiness(user._id, false)}
                      >
                        <X className="h-4 w-4" />
                      </button>

                    </div>
                  )}

                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="flex items-center justify-center h-[400px]">
            No Data Found.
          </p>
        )}
      </div>
    </>
  );
}
