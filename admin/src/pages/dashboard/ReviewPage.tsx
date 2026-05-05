import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash } from "lucide-react";
import DeleteCard from "@/components/cards/DeleteCard";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/redux-toolkit/customHook/hook";
import { getReviews, deleteSingleReview } from "@/service/review";
import { setReviewList, setRemoveReview } from "@/redux-toolkit/slice/reviewSlice";
import ReviewDialog from "@/components/forms/ReviewDialog";

export default function ReviewPage() {
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [initialData, setInitialData] = useState(null);

  const [deleteReviews, setDeleteReviews] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [reviewListRefresh, setReviewListRefresh] = useState(false);

  const reviewList = useAppSelector((state) => state?.reviews?.reviewsList);

  // ✅ GET REVIEWS
  const handleGetReview = async () => {
    try {
      const res = await getReviews();
      if (res.status === 200) {
        dispatch(setReviewList(res?.data?.data));
        setReviewListRefresh(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (reviewList?.length === 0 || reviewListRefresh) {
      handleGetReview();
    }
  }, [reviewList?.length, reviewListRefresh]);


  const handleDeleteReview = async () => {
    try {
      setDeleteLoading(true);

      const res = await deleteSingleReview(deleteReviews?._id);

      if (res?.status === 200) {
        toast({
          title: "Review Deleted Successfully",
          description: res?.data?.message,
        });
        dispatch(setRemoveReview(deleteReviews?._id));
        setDeleteDialogOpen(false);
        setDeleteReviews(null);
      }
    } catch (err: any) {
      toast({
        title: "Delete Failed",
        description:
          err?.response?.data?.message || err?.message,
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // ✅ truncate description
  const truncateText = (text: string, limit: number) => {
    if (!text) return "";
    return text.length > limit
      ? text.substring(0, limit) + "..."
      : text;
  };

  return (
    <>
      {/* DELETE MODAL */}
      <DeleteCard
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        isLoading={deleteLoading}
        buttonName="Delete"
        title={`Delete Review: ${deleteReviews?.fullName}`}
        description={`Are you sure you want to delete this review by "${deleteReviews?.fullName}"?`}
        onConfirm={handleDeleteReview}
      />

      {/* REVIEW DIALOG */}
      <ReviewDialog
        isOpen={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        initialData={initialData}
      />

      <div className="space-y-4">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">
            All Reviews
          </h3>

          <Button
            onClick={() => {
              setInitialData(null);
              setReviewDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Create Review
          </Button>
        </div>

        {/* TABLE */}
        {reviewList?.length > 0 ? (
          <div className="overflow-x-auto">
           <table className="w-full border rounded-lg table-fixed">
  <thead className="bg-gray-100 text-sm">
    <tr>
      <th className="p-3 w-[25%] text-left">Full Name</th>

      <th className="p-3 w-[55%] text-left">
        Description
      </th>

      <th className="p-3 w-[20%] text-right">
        Actions
      </th>
    </tr>
  </thead>

  <tbody>
    {reviewList.map((item) => (
      <tr key={item._id} className="border-t hover:bg-gray-50">

        {/* FULL NAME */}
        <td className="p-3 font-medium truncate">
          {item.fullName}
        </td>

        {/* DESCRIPTION */}
        <td className="p-3 text-sm text-gray-600 truncate">
          {truncateText(item.description, 50)}
        </td>

        {/* ACTIONS */}
        <td className="p-3 text-right">
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setInitialData(item);
                setReviewDialogOpen(true);
              }}
            >
              <Edit className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setDeleteReviews(item);
                setDeleteDialogOpen(true);
              }}
            >
              <Trash className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </td>

      </tr>
    ))}
  </tbody>
</table>
          </div>
        ) : (
          <p className="flex justify-center items-center h-[300px]">
            No Reviews Found
          </p>
        )}
      </div>
    </>
  );
}