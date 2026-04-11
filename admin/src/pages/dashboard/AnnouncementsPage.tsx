import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash } from "lucide-react";
import { announcements as initialAnn } from "@/lib/dummy-data";
import { addAnnouncement, getAllAnnouncement, deleteAnnouncement } from "@/service/announcement";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/redux-toolkit/customHook/hook";
import { setAnnouncementList } from "@/redux-toolkit/slice/announcementSlice";
import DeleteCard from "@/components/cards/DeleteCard";


export default function AnnouncementsPage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const { toast } = useToast();
  const [formData, setFormData] = useState({title:"", description:"", priority:""});
  const [announcementListRefresh, setAnnouncementListRefresh] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteAnnouncements, setDeleteAnnouncements] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const dispatch = useAppDispatch();
  const announcementList = useAppSelector((state) => state?.announcement?.announcementList);

  const resetForm = () => {setFormData({title:"", description:"", priority:""})};

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    console.log(formData);
    let obj = { ...formData, createdBy: user?._id }
    try {
      const res = await addAnnouncement(obj);
      if (res.status === 201) {
        toast({ title: "Announcement Successfully.", description: res?.data?.message });
        setDialogOpen(false);
        setAnnouncementListRefresh(true);
        resetForm();
      }
    }
    catch (err) {
      toast({ title: "Announcement Failed.", description: err?.response?.data?.message || err?.message, variant: "destructive" })
    }
  };

  const handleGetAllAnnouncements = async () => {
    try {
      const res = await getAllAnnouncement();
      if (res.status === 200) {
        dispatch(setAnnouncementList(res?.data?.announcements));
        setAnnouncementListRefresh(false);
      }
    }
    catch (err) {
      console.log(err);
    }
  };

  const handleDeleteAnnouncement = async () => {
    if (!deleteAnnouncements?._id) return;
    try {
      const res = await deleteAnnouncement(deleteAnnouncements?._id);
      console.log(res)
      if (res.status === 200) {
        toast({ title: "Announcment Delete Successfully.", description: res?.data?.message });
        setAnnouncementListRefresh(true);
        setDeleteDialogOpen(false);
        setDeleteAnnouncements(null);
      }
    }
    catch (err) {
      console.log(err)
      toast({ title: "Announcement Delete Failed.", description: err?.response?.data?.message || err?.message, variant: "destructive" })
    }
  }

  useEffect(() => {
    if (announcementList?.length === 0 || announcementListRefresh) {
      handleGetAllAnnouncements();
    }
  }, [announcementList?.length, announcementListRefresh])

  return (
    <>
      <DeleteCard
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        isLoading={deleteLoading}
        buttonName="Delete"
        title={`Delete Announcement: ${deleteAnnouncements?.title}`}
        description={`Are you sure you want to delete the announcement "${deleteAnnouncements?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteAnnouncement}
      />

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-display font-semibold text-lg">Announcements</h3>
          <Dialog open={dialogOpen} onOpenChange={(open) => {resetForm(); setDialogOpen(open)}}>
            <DialogTrigger asChild>
              <Button className="gradient-gold text-secondary-foreground font-semibold"><Plus className="h-4 w-4 mr-1" /> Post</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Post Announcement</DialogTitle></DialogHeader>
              <form onSubmit={handleAddAnnouncement} className="space-y-3">
                <Input name="title" placeholder="Title" required value={formData?.title} onChange={(e) => { setFormData({ ...formData, title: e.target.value }) }} />
                <Textarea name="content" placeholder="Write your announcement..." rows={4} value={formData?.description} required onChange={(e) => { setFormData({ ...formData, description: e.target.value }) }} />
                <select name="priority" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData?.priority} required onChange={(e) => { setFormData({ ...formData, priority: e.target.value }) }} >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <Button disabled={!formData?.title || !formData?.description || !formData?.priority} type="submit" className="w-full gradient-gold text-secondary-foreground font-semibold">Post</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

       <div className="space-y-3">
  {announcementList?.length > 0 ? (
    announcementList.map((ann) => (
      <Card key={ann?._id} className="shadow-card relative">

        {/* 🔥 DELETE ICON */}
        <button
          onClick={() => {
            setDeleteAnnouncements(ann);
            setDeleteDialogOpen(true);
          }}
          className="absolute top-3 right-3 p-1 rounded hover:bg-red-100 transition"
        >
          <Trash className="w-4 h-4 text-red-500" />
        </button>

        <CardContent className="p-5">

          <div className="flex items-start justify-between mb-2 pr-8">
            <h3 className="font-display font-semibold">{ann.title}</h3>

            <span className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ml-3 ${ ann.priority === "high" ? "bg-destructive/10 text-destructive" : ann.priority === "medium" ? "bg-warning/10 text-warning"  : "bg-muted text-muted-foreground" }`}>
              {ann?.priority}
            </span>
          </div>

          <p className="text-sm text-muted-foreground mb-3"> {ann.description} </p>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>By Admin</span>
            <span> {new Date(ann.createdAt).toLocaleString([], { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} </span>
          </div>

        </CardContent>
      </Card>
    ))
  ) : (
    <div className="flex items-center justify-center h-[300px]">
      <p className="text-muted-foreground text-sm">
        No Announcements Found.
      </p>
    </div>
  )}
</div>
      </div>
    </>
  );
}
