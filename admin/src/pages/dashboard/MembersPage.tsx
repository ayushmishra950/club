import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Plus, Search, Grid3X3, List, Mail, Phone, Trash2, Edit, MoreVertical } from "lucide-react";
import { members as initialMembers } from "@/lib/dummy-data";
import { getAllUser } from "@/service/auth";
import { useToast } from "@/hooks/use-toast";
import {verifyUser, deletedUser} from "@/service/auth";
import RoleDialog from "@/components/forms/RoleDialog";
import DeleteCard from "@/components/cards/DeleteCard";
import {setUserList} from "@/redux-toolkit/slice/userSlice";
import { useAppDispatch, useAppSelector } from "@/redux-toolkit/customHook/hook";

export default function MembersPage() {
  const {toast} = useToast();
  const [members, setMembers] = useState(initialMembers);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"table" | "card">("table");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);
  const [totalPages, setTotalPages] = useState(0);
  const [memberListRefresh,setMemberListRefresh] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [roleDailog, setRoleDialog] = useState(false);
  const [deleteUser, setDeleteUser] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const dispatch = useAppDispatch();
  const memberList = useAppSelector((state)=> state?.user?.userList);


  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setMembers([...members, {
      id: String(Date.now()),
      name: fd.get("name") as string,
      role: fd.get("role") as string,
      email: fd.get("email") as string,
      phone: fd.get("phone") as string,
      joined: new Date().toISOString().split("T")[0],
      avatar: "",
      status: "active",
    }]);
    setDialogOpen(false);
  };

  const handleGetUsers = async () => {
    try {
      const res = await getAllUser({ page, perPage, search });
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
    if(page || perPage || search || memberListRefresh)
   { handleGetUsers()}
  }, [page, perPage, search, memberListRefresh]);

  const handleVerifyUser = async(id:string) => {
    try{
        const res = await verifyUser(id);
        if(res?.status === 200){
          toast({title:"User Verified Successfully.", description:res?.data?.message});
          setMemberListRefresh(true);
        }
    }catch (err) {
      console.log(err);
      toast({title:"User Verified Failed.", description:err?.response?.data?.message || err?.message , variant:"destructive"})
    }
  }

  const handleDeleteUser = async() => {
    try{
       setDeleteLoading(true);
       const res = await  deletedUser(deleteUser?._id);

       if(res?.status === 200){
        toast({title:"User Deleted Successfully.", description:res?.data?.message});
        setMemberListRefresh(true);
        setDeleteDialogOpen(false);
        setDeleteUser(null);
       }
    }
    catch (err) {
      console.log(err);
      toast({title:"User Deleted Failed.", description:err?.response?.data?.message || err?.message , variant:"destructive"})
    }finally{
      setDeleteLoading(false);
    }

  }

  return (
    <>
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
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members..." className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => setView("table")} className={view === "table" ? "bg-muted" : ""}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setView("card")} className={view === "card" ? "bg-muted" : ""}>
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-gold text-secondary-foreground font-semibold"><Plus className="h-4 w-4 mr-1" /> Add Member</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Member</DialogTitle></DialogHeader>
              <form onSubmit={handleAdd} className="space-y-3">
                <Input name="name" placeholder="Full Name" required />
                <Input name="email" type="email" placeholder="Email" required />
                <Input name="phone" placeholder="Phone" required />
                <Input name="role" placeholder="Role" defaultValue="Member" required />
                <Button type="submit" className="w-full gradient-gold text-secondary-foreground font-semibold">Add Member</Button>
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
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Role</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden lg:table-cell">Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberList?.map((m) => (
                <TableRow key={m?._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shrink-0">
                        <span className="text-primary-foreground text-xs font-bold">{m?.fullName?.split(" ")?.map(n => n[0])?.join("")}</span>
                      </div>
                      <span className="font-medium text-sm">{m?.fullName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">{m.role==="user" ? "Member" : m?.role?.charAt(0).toUpperCase() + m?.role?.slice(1)}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{m.email}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{m.phone}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${m?.blocked ? "bg-red-100 text-red-600" : !m?.isVerified ? "bg-yellow-100 text-yellow-600" : "bg-green-100 text-green-600"}`}>
                      {m?.blocked ? "Blocked" : !m?.isVerified ? "Unverified" : "Active"}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      {!m?.isVerified && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {handleVerifyUser(m._id)}}
                        >
                          Verify
                        </Button>
                      )}

                      {/* Three-dot dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={() => {setInitialData(m);setRoleDialog(true)}}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Edit className="h-3.5 w-3.5" /> Role Asign
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {setDeleteUser(m); setDeleteDialogOpen(true)}}
                            className="flex items-center gap-2 text-destructive cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>
          <div className="flex justify-end items-center my-3 mx-3 gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </Button>
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {memberList?.map((m) => (
            <Card key={m?._id} className="shadow-card hover:shadow-elevated transition-shadow">
              <CardContent className="p-5 text-center">
                <div className="w-16 h-16 rounded-full gradient-primary mx-auto mb-3 flex items-center justify-center">
                  <span className="text-primary-foreground font-display font-bold text-lg">{m?.fullName?.split(" ")?.map(n => n[0])?.join("")}</span>
                </div>
                <h3 className="font-display font-semibold">{m?.fullName}</h3>
                <p className="text-sm text-muted-foreground mb-3">{m?.role}</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center justify-center gap-1"><Mail className="h-3 w-3" /> {m?.email}</div>
                  <div className="flex items-center justify-center gap-1"><Phone className="h-3 w-3" /> {m?.phone}</div>
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
