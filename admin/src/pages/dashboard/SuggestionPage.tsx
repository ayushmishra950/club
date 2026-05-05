import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trash, MessageSquareReply } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/redux-toolkit/customHook/hook";
import DeleteCard from "@/components/cards/DeleteCard";
import { setSuggestionList, setNewSuggestion, setDeleteSuggestion, setUpdateSuggestionStatus } from "@/redux-toolkit/slice/suggestionSlice";
import { getAllSuggestion, deleteSuggestion, updateSuggestionStatus, replyToSuggestion } from "@/service/suggestion";
import socket from "@/socket/socket";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SuggestionPage() {
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  const suggestionList = useAppSelector((state) => state?.suggestion?.suggestionList);

  const [deleteData, setDeleteData] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [replyState, setReplyState] = useState<Record<string, string>>({});
  const [replyLoading, setReplyLoading] = useState<string | null>(null);
  const [replyModalOpen, setReplyModalOpen] = useState<string | null>(null); // Track which item is being replied to

  useEffect(() => {
    socket.on("addSuggestion", (data) => {
      dispatch(setNewSuggestion(data));
    });

    socket.on("deleteSuggestion", (data) => {
      dispatch(setDeleteSuggestion(data))
    })

    return () => {
      socket.off("addSuggestion");
      socket.off("deleteSuggestion");
    }
  }, []);


  const handleGetSuggestions = async () => {
    try {
      setLoading(true);
      const res = await getAllSuggestion();
      if (res.status === 200) {
        dispatch(setSuggestionList(res?.data?.data || res?.data));
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (suggestionList?.length === 0) {
      handleGetSuggestions();
    }
  }, [suggestionList?.length]);

  const handleUpdateStatus = async (id: string, status: string) => {
    setLoading(true);
    let obj = { id, status };

    try {
      const res = await updateSuggestionStatus(obj);

      if (res.status === 200) {
        toast({ title: "Status Updated", description: "Suggestion status updated successfully" });
        dispatch(setUpdateSuggestionStatus(res?.data?.data));
      }
    } catch (err) {
      toast({ title: "Update Failed", description: "Failed to update status", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };


  const handleReply = async (id: string) => {
    const text = replyState[id]?.trim();
    if (!text) return;
    setReplyLoading(id);
    try {
      const res = await replyToSuggestion({ id, adminReply: text });
      if (res.status === 200) {
        toast({ title: "Reply Sent", description: "Your reply was sent to the user." });
        dispatch(setUpdateSuggestionStatus(res?.data?.data));
        setReplyState((prev) => ({ ...prev, [id]: "" }));
        setReplyModalOpen(null); // Close modal instead of inline
      }
    } catch (err: any) {
      toast({ title: "Reply Failed", description: err?.response?.data?.message || err?.message, variant: "destructive" });
    } finally {
      setReplyLoading(null);
    }
  };


  const handleDeleteSuggestion = async () => {
    if (!deleteData?._id) return;

    setDeleteLoading(true);

    try {
      const res = await deleteSuggestion(deleteData?._id);

      if (res.status === 200) {
        toast({ title: "Suggestion Deleted Successfully", description: res?.data?.message });

        setDeleteDialogOpen(false);
        setDeleteData(null);

      }
    } catch (err) {
      toast({ title: "Delete Failed", description: err?.response?.data?.message || err?.message, variant: "destructive" });
    } finally {
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

      {/* REPLY MODAL */}
      {replyModalOpen && (
        <Dialog open={!!replyModalOpen} onOpenChange={() => setReplyModalOpen(null)}>
          <DialogContent className="max-w-md w-full">
            <DialogHeader>
              <DialogTitle>Reply to Suggestion</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Reply History */}
              {suggestionList
                .find((item) => item._id === replyModalOpen)
                ?.adminReplies?.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-blue-700 mb-3">
                    Reply History
                  </p>
                  <ScrollArea className="h-auto max-h-48 pr-4">
                    <div className="space-y-3">
                      {suggestionList
                        .find((item) => item._id === replyModalOpen)
                        ?.adminReplies?.map((reply: any, idx: number) => (
                          <div key={idx} className="bg-white p-2 rounded border border-blue-100">
                            <p className="text-sm text-gray-800">{reply.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(reply.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Reply Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Reply</label>
                <textarea
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Type your reply here..."
                  value={replyState[replyModalOpen] || ""}
                  onChange={(e) =>
                    setReplyState((prev) => ({
                      ...prev,
                      [replyModalOpen]: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setReplyModalOpen(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  disabled={
                    replyLoading === replyModalOpen ||
                    !replyState[replyModalOpen]?.trim()
                  }
                  onClick={() => handleReply(replyModalOpen)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {replyLoading === replyModalOpen ? "Sending..." : "Send Reply"}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <div className="space-y-4">
        <h3 className="font-display font-semibold text-lg">
          Suggestions
        </h3>

        {/* LIST */}
        <div className="space-y-3">
          {suggestionList?.length > 0 ? (
            <>
              {/* ================= DESKTOP TABLE ================= */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-100 text-left text-sm">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Suggestion</th>
                      <th className="p-3">Created At</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {suggestionList.map((item) => (
                      <tr key={item?._id} className="border-t hover:bg-gray-50">
                        {/* USER */}
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={
                                item?.createdBy?.profileImage ||
                                "https://via.placeholder.com/40"
                              }
                              className="w-10 h-10 rounded-full object-cover border"
                            />
                            <span className="text-sm font-medium">
                              {item?.createdBy?.fullName}
                            </span>
                          </div>
                        </td>

                        {/* EMAIL */}
                        <td className="p-3 text-sm">
                          {item?.createdBy?.email}
                        </td>

                        {/* DESCRIPTION */}
                        <td className="p-3 text-sm text-gray-600 max-w-xs truncate">
                          {item?.description}
                        </td>

                        {/* DATE */}
                        <td className="p-3 text-sm">
                          {new Date(item.createdAt).toLocaleString([], {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>

                        {/* STATUS */}
                        <td className="p-3">
                          <div className="flex items-center gap-2">

                            {/* STATUS BADGE */}
                            <span
                              className={`inline-block px-2 py-1 text-xs font-medium rounded-full capitalize
                                 ${item?.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : item?.status === "accepted"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                            >
                              {item?.status}
                            </span>

                            {/* ACTION BUTTONS (ONLY PENDING) */}
                            {item?.status === "pending" && (
                              <div className="flex items-center gap-1">

                                {/* ACCEPT */}
                                <button
                                  onClick={() => handleUpdateStatus(item._id, "accepted")}
                                  className="w-7 h-7 flex items-center justify-center rounded-full bg-green-100 hover:bg-green-200"
                                >
                                  ✓
                                </button>

                                {/* REJECT */}
                                <button
                                  onClick={() => handleUpdateStatus(item._id, "rejected")}
                                  className="w-7 h-7 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200"
                                >
                                  ✕
                                </button>

                              </div>
                            )}
                          </div>
                        </td>

                        {/* ACTION */}
                        <td className="p-3">
                          <div className="flex flex-col items-end gap-2">
                            {/* Reply button */}
                            <button
                              onClick={() => setReplyModalOpen(item._id)}
                              className="p-1.5 rounded hover:bg-blue-100"
                              title="Reply to user"
                            >
                              <MessageSquareReply className="w-4 h-4 text-blue-500" />
                            </button>

                            {/* Delete button */}
                            <button
                              onClick={() => {
                                setDeleteData(item);
                                setDeleteDialogOpen(true);
                              }}
                              className="p-1.5 rounded hover:bg-red-100"
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

              {/* ================= MOBILE VIEW ================= */}
              <div className="md:hidden space-y-3">
                {suggestionList.map((item) => (
                  <React.Fragment key={item?._id}>
                  <div
                    className="border rounded-lg p-3 flex justify-between gap-3"
                  >
                    {/* USER + CONTENT */}
                    <div className="flex gap-3 flex-1">
                      <img
                        src={
                          item?.createdBy?.profileImage ||
                          "https://via.placeholder.com/40"
                        }
                        className="w-10 h-10 rounded-full object-cover"
                      />

                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {item?.createdBy?.fullName}
                        </p>

                        <p className="text-xs text-gray-500">
                          {item?.createdBy?.email}
                        </p>

                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {item?.description}
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(item.createdAt).toLocaleString([], {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>

                        <div className="flex items-center gap-2 mt-1">

                          <span
                            className={`text-xs px-2 py-1 rounded-full capitalize
      ${item?.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : item?.status === "accepted"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                          >
                            {item?.status}
                          </span>

                          {item?.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(item._id, "accepted")}
                                className="w-6 h-6 flex items-center justify-center rounded-full bg-green-100"
                              >
                                ✓
                              </button>

                              <button
                                onClick={() => handleUpdateStatus(item._id, "rejected")}
                                className="w-6 h-6 flex items-center justify-center rounded-full bg-red-100"
                              >
                                ✕
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ACTION */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => setReplyModalOpen(item._id)}
                        className="p-1 rounded hover:bg-blue-100"
                        title="Reply"
                      >
                        <MessageSquareReply className="w-4 h-4 text-blue-500" />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteData(item);
                          setDeleteDialogOpen(true);
                        }}
                        className="p-1 rounded hover:bg-red-100"
                      >
                        <Trash className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  </React.Fragment>
                ))}
              </div>
            </>
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