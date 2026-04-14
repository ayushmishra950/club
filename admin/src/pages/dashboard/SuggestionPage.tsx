import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/redux-toolkit/customHook/hook";
import DeleteCard from "@/components/cards/DeleteCard";
import { setSuggestionList, setNewSuggestion, setDeleteSuggestion} from "@/redux-toolkit/slice/suggestionSlice";
import { getAllSuggestion, deleteSuggestion} from "@/service/suggestion";
import socket from "@/socket/socket";

export default function SuggestionPage() {
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  const suggestionList = useAppSelector( (state) => state?.suggestion?.suggestionList);

  const [deleteData, setDeleteData] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    socket.on("addSuggestion", (data) => {
      console.log(data);
     dispatch(setNewSuggestion(data));
    });

    socket.on("deleteSuggestion", (data) => {
      dispatch(setDeleteSuggestion(data))
    })

    return () => {
      socket.off("addSuggestion");
      socket.off("deleteSuggestion");
    }
  },[]);


  const handleGetSuggestions = async () => {
    try {
      setLoading(true);
      const res = await getAllSuggestion();
      if (res.status === 200) {
        dispatch(setSuggestionList(res?.data?.data || res?.data));
      }
    } catch (err) {
      console.log(err);
    }finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    if(suggestionList?.length ===0){
    handleGetSuggestions();
    }
  }, [suggestionList?.length]);

  
  const handleDeleteSuggestion = async () => {
    if (!deleteData?._id) return;

    setDeleteLoading(true);

    try {
      const res = await deleteSuggestion(deleteData?._id);

      if (res.status === 200) {
        toast({ title: "Suggestion Deleted Successfully", description:res?.data?.message });

        setDeleteDialogOpen(false);
        setDeleteData(null);
    
      }
    } catch (err) {
      toast({ title: "Delete Failed", description: err?.response?.data?.message || err?.message, variant: "destructive"});
    }finally{
      setDeleteLoading(false);
    }
  };

     
   if (suggestionList?.length === 0 && loading) {
  return (
    <div className="flex items-center justify-center h-screen">
      <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
    </div>
  );
}

  return (
    <>
      {/* DELETE MODAL */}
      <DeleteCard
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        isLoading={deleteLoading}
        title="Delete Suggestion"
        description="Are you sure you want to delete this suggestion?"
        onConfirm={handleDeleteSuggestion}
      />

      <div className="space-y-4">
        <h3 className="font-display font-semibold text-lg">
          Suggestions
        </h3>

        {/* LIST */}
        <div className="space-y-3">
          {suggestionList?.length > 0 ? (
            suggestionList.map((item) => (
              <Card
                key={item?._id}
                className="shadow-card relative"
              >
                {/* DELETE ICON */}
                <button
                  onClick={() => {
                    setDeleteData(item);
                    setDeleteDialogOpen(true);
                  }}
                  className="absolute top-3 right-3 p-1 rounded hover:bg-red-100 transition"
                >
                  <Trash className="w-4 h-4 text-red-500" />
                </button>

                <CardContent className="p-5">
                  {/* USER INFO */}
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={
                        item?.createdBy?.profileImage ||
                        "https://via.placeholder.com/40"
                      }
                      className="w-10 h-10 rounded-full object-cover"
                    />

                    <div>
                      <p className="text-sm font-semibold">
                        {item?.createdBy?.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item?.createdBy?.email}
                      </p>
                    </div>
                  </div>

                  {/* MESSAGE */}
                  <p className="text-sm text-foreground mb-3">
                    {item?.description}
                  </p>

                  {/* TIME */}
                  <div className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString(
                      [],
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-muted-foreground text-sm">
                No Suggestions Found.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}