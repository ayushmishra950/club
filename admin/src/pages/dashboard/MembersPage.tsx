import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Plus, Search, Grid3X3, List, Mail, Phone, MoreVertical, Loader2 } from "lucide-react";
import { getAllUser } from "@/service/auth";
import { useToast } from "@/hooks/use-toast";
import { verifyUser, deletedUser, activeAndInactiveUser, uploadExcel } from "@/service/auth";
import RoleDialog from "@/components/forms/RoleDialog";
import DeleteCard from "@/components/cards/DeleteCard";
import MemberDetailCard from "@/components/cards/MemberDetailCard";
import { setUserList, setActiveAndInactiveUser, setAddNewUser, setUpdateUser } from "@/redux-toolkit/slice/userSlice";
import { useAppDispatch, useAppSelector } from "@/redux-toolkit/customHook/hook";
import socket from "@/socket/socket";
import PaymentDetailCard from "@/components/cards/PaymentDetailCard";

export default function MembersPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"table" | "card">("table");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);
  const [totalPages, setTotalPages] = useState(0);
  const [memberListRefresh, setMemberListRefresh] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [roleDailog, setRoleDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedMemebersId, setSelectedMembersId] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState("active");
  const dispatch = useAppDispatch();

  const memberList = useAppSelector((state) => state?.user?.userList);

  useEffect(() => {
    socket.on("newUser", (data: any) => {
      dispatch(setAddNewUser(data));
    });
    socket.on("premiumStatusUpdated", (data: any) => {
      dispatch(setUpdateUser(data));
    });
    return () => {
      socket.off("newUser");
      socket.off("premiumStatusUpdated");
    }
  }, [])

  const handleUploadExcel = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("excelFile", excelFile);

    try {
      const res = await uploadExcel(formData);

      console.log(res);

      if (res.status === 201) {
        const { inserted, duplicates, insertedCount, duplicateCount } = res.data;

        // ✅ 1. ALWAYS dispatch only inserted users
        if (inserted?.length > 0) {
          dispatch(setAddNewUser(inserted));
        }

        // ✅ 2. Build message logic
        if (duplicateCount === 0) {
          // 🎉 PURE SUCCESS CASE
          toast({
            title: "Upload Successful",
            description: `${insertedCount} members added successfully`,
          });
        } else {
          // ⚠️ DUPLICATE CASE
          const duplicateMsg = duplicates
            .map(
              (d) => `${d.fullName} - ${d.reason}`
            )
            .join(" | ");

          toast({
            title: "Upload Completed with Duplicates",
            description: duplicateMsg,
            variant: "destructive",
          });
        }

        setUploadDialogOpen(false);
        setExcelFile(null);
      }
    } catch (err) {
      console.log(err);
      toast({
        title: "Add Member Failed.",
        description:
          err?.response?.data?.message || err?.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetUsers = async () => {
    try {
      const res = await getAllUser({ page, perPage, search, filterStatus });
      console.log(res);
      if (res.status === 200) {
        dispatch(setUserList(res?.data?.users));
        setTotalPages(Math.ceil(res?.data?.total / perPage));

        setMemberListRefresh(false);
      }
    }
    catch (err) {
      console.log(err);
    }
  }
  useEffect(() => {
    if (page || perPage || search || memberListRefresh || filterStatus) { handleGetUsers() }
  }, [page, perPage, search, memberListRefresh, filterStatus]);

  const handleVerifyUser = async (id?: string) => {
    let membersIds = selectedMemebersId?.length > 0 ? selectedMemebersId : [id];
    try {
      const res = await verifyUser(membersIds);
      if (res?.status === 200) {
        toast({ title: "User Verified Successfully.", description: res?.data?.message });
        setMemberListRefresh(true);
        setSelectedMembersId([]);
      }
    } catch (err) {
      console.log(err);
      toast({ title: "User Verified Failed.", description: err?.response?.data?.message || err?.message, variant: "destructive" })
    }
  };

  const handleActiveAndInactiveUser = async (id: string, status: boolean) => {
    if (!id) return;
    try {
      const res = await activeAndInactiveUser(id, status);
      if (res?.status === 200) {
        toast({ title: `${status === true ? "User Blocked" : "User UnBlocked"} Successfully.`, description: res?.data?.message });
        dispatch(setActiveAndInactiveUser({ id, status }));
      }
    } catch (err) {
      console.log(err);
      toast({ title: "User Status Changed Failed.", description: err?.response?.data?.message || err?.message, variant: "destructive" })
    }
  };

  const handleDeleteUser = async () => {
    try {
      setDeleteLoading(true);
      const res = await deletedUser(deleteUser?._id);

      if (res?.status === 200) {
        toast({ title: "User Deleted Successfully.", description: res?.data?.message });
        setMemberListRefresh(true);
        setDeleteDialogOpen(false);
        setDeleteUser(null);
      }
    }
    catch (err) {
      console.log(err);
      toast({ title: "User Deleted Failed.", description: err?.response?.data?.message || err?.message, variant: "destructive" })
    } finally {
      setDeleteLoading(false);
    }

  }

  return (
    <>
      <MemberDetailCard member={selectedMember} detailDialogOpen={detailDialogOpen} setDetailDialogOpen={setDetailDialogOpen} />
      <PaymentDetailCard paymentDialog={paymentDialog} setPaymentDialog={setPaymentDialog} selectedPayment={selectedPayment} />
      <DeleteCard
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        isLoading={deleteLoading}
        buttonName="Delete"
        title={`Delete Member: ${deleteUser?.fullName}`} // Dynamic title
        description={`Are you sure you want to delete the member "${deleteUser?.fullName}"? This action cannot be undone.`} // Dynamic description
        onConfirm={handleDeleteUser}
      />

      <RoleDialog isOpen={roleDailog} onOpenChange={setRoleDialog} initialData={initialData} setMemberListRefresh={setMemberListRefresh} />
      <div className="space-y-4">
        <div className="flex flex-row gap-3 items-start sm:items-center justify-between">

          <div className="flex flex-col md:flex-row md:items-center gap-3">

            {/* 🔍 SEARCH INPUT */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search members..."
                className="pl-9"
              />
            </div>

            {/* 🔘 ACTIVE / INACTIVE TOGGLE */}
            <div className="flex items-center border rounded-md overflow-hidden text-sm w-fit md:w-auto">

              <button
                onClick={() => setFilterStatus("active")}
                className={`px-3 py-1 transition ${filterStatus === "active"
                  ? "bg-green-500 text-white"
                  : "bg-white hover:bg-gray-100"
                  }`}
              >
                Active
              </button>

              <button
                onClick={() => setFilterStatus("inactive")}
                className={`px-3 py-1 transition border-l ${filterStatus === "inactive"
                  ? "bg-red-500 text-white"
                  : "bg-white hover:bg-gray-100"
                  }`}
              >
                Inactive
              </button>

            </div>

          </div>
          <div className="flex gap-2 ">
            <div className="hidden md:flex gap-2">
              {selectedMemebersId?.length > 0 && <Button onClick={() => handleVerifyUser()} className="gradient-gold text-secondary-foreground font-semibold">Users Verify</Button>}
              <Button variant="ghost" size="icon" onClick={() => setView("table")} disabled={selectedMemebersId?.length > 0} className={view === "table" ? "bg-muted" : ""}>
                <List className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setView("card")} disabled={selectedMemebersId?.length > 0} className={view === "card" ? "bg-muted" : ""}>
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-gold text-secondary-foreground font-semibold">
                  <Plus className="h-4 w-4 mr-1" />
                  Upload Members
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Members File</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleUploadExcel} className="space-y-4">

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">  Upload Excel File </label>

                    <Input type="file" accept=".xlsx,.xls"
                      onChange={(e) =>
                        setExcelFile(e.target.files?.[0])
                      }
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full gradient-gold text-secondary-foreground font-semibold flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Upload File"
                    )}
                  </Button>

                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {view === "table" ? (
          <Card className="shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30px] px-2 text-center">
                    <input type="checkbox" className="w-4 h-4 cursor-pointer" />
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">UserId</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Role</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden lg:table-cell">Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {memberList?.length > 0 ? (
                  memberList.map((m, i) => (
                    <TableRow key={m?._id} className="sm:px-4 px-2">

                      {/* CHECKBOX */}
                      <TableCell className="w-[30px] px-2 text-center">
                        <input type="checkbox" className="w-4 h-4 cursor-pointer"
                          checked={selectedMemebersId.includes(m._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMembersId((prev) => [...prev, m._id]);
                            } else {
                              setSelectedMembersId((prev) =>
                                prev.filter((id) => id !== m._id)
                              );
                            }
                          }}
                        />
                      </TableCell>

                      {/* USER ID */}
                      <TableCell className="hidden sm:table-cell">
                        {m?.userId || i + 1}
                      </TableCell>

                      {/* NAME */}
                      <TableCell className="px-2 sm:px-4 py-2">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full gradient-primary flex items-center justify-center shrink-0">
                            <span className="text-primary-foreground text-[10px] sm:text-xs font-bold">
                              {m?.fullName?.split(" ")?.map(n => n[0])?.join("")}
                            </span>
                          </div>

                          <span className="font-medium text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
                            {m?.fullName}
                          </span>
                        </div>
                      </TableCell>

                      {/* ROLE */}
                      <TableCell className="hidden sm:table-cell text-xs sm:text-sm">
                        {m.role === "user"
                          ? "Member"
                          : m?.role?.charAt(0).toUpperCase() + m?.role?.slice(1)}
                      </TableCell>

                      {/* EMAIL */}
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {m.email}
                      </TableCell>

                      {/* PHONE */}
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {m.mobile}
                      </TableCell>

                      {/* STATUS */}
                      <TableCell className="px-2 sm:px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium ${m?.blocked
                            ? "bg-red-100 text-red-600"
                            : !m?.isVerified
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-green-100 text-green-600"
                            }`}
                        >
                          {m?.blocked
                            ? "Blocked"
                            : !m?.isVerified
                              ? "Unverified"
                              : "Active"}
                        </span>
                      </TableCell>

                      {/* ACTIONS */}
                      <TableCell className="text-right px-2 sm:px-4">
                        <div className="flex justify-end items-center gap-1 sm:gap-2">

                          {!m?.isVerified && (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-7 px-2 text-[10px] sm:text-sm"
                              onClick={() => handleVerifyUser(m._id)}
                            >
                              Verify
                            </Button>
                          )}

                          {(m?.isVerified && m?.paymentImage && m?.transitionNumber) && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-[10px] sm:text-sm"
                              onClick={() => {
                                setSelectedPayment(m);
                                setPaymentDialog(true);
                              }}
                            >
                              {m?.premiumUser === "premium"
                                ? "View Payment"
                                : "Payment Verify"}
                            </Button>
                          )}

                          {/* DROPDOWN */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 sm:h-8 sm:w-8"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-36 sm:w-40">
                              <DropdownMenuItem onClick={() => { setSelectedMember(m); setDetailDialogOpen(true); }} className="cursor-pointer">
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setInitialData(m); setRoleDialog(true); }} className="cursor-pointer">
                                Role Assign
                              </DropdownMenuItem>

                              {m?.blocked === false && (
                                <DropdownMenuItem onClick={() => handleActiveAndInactiveUser(m._id, true)} className="cursor-pointer">
                                  Block
                                </DropdownMenuItem>
                              )}

                              {m?.blocked === true && (
                                <DropdownMenuItem onClick={() => handleActiveAndInactiveUser(m._id, false)} className="cursor-pointer">
                                  Unblock
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuItem
                                className="text-destructive cursor-pointer"
                                onClick={() => {
                                  setDeleteUser(m);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                        </div>
                      </TableCell>

                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No Member Found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* PAGINATION */}
            <div className="flex justify-end items-center my-2 mx-2 gap-2">
              <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
                Prev
              </Button>

              <span className="text-xs sm:text-sm">
                Page {page} of {totalPages}
              </span>

              <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {memberList?.map((m) => (
              <Card key={m?._id} className="shadow-card hover:shadow-elevated transition-shadow relative">
                <div className="absolute top-3 left-3">
                  <input type="checkbox" className="w-4 h-4 cursor-pointer" />
                </div>
                <CardContent className="p-5 text-center">
                  <div className="w-16 h-16 rounded-full gradient-primary mx-auto mb-3 flex items-center justify-center">
                    <span className="text-primary-foreground font-display font-bold text-lg">{m?.fullName?.split(" ")?.map(n => n[0])?.join("")}</span>
                  </div>
                  <h3 className="font-display font-semibold">{m?.fullName}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{m?.role}</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center justify-center gap-1"><Mail className="h-3 w-3" /> {m?.email}</div>
                    <div className="flex items-center justify-center gap-1"><Phone className="h-3 w-3" /> {m?.mobile}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${m?.blocked ? "bg-red-100 text-red-600" : !m?.isVerified ? "bg-yellow-100 text-yellow-600" : "bg-green-100 text-green-600"}`}>{m?.blocked ? "Blocked" : !m?.isVerified ? "Unverified" : "Active"}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
