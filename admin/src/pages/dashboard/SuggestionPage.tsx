// import React, { useEffect, useState } from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Trash, MessageSquareReply } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { useAppDispatch, useAppSelector } from "@/redux-toolkit/customHook/hook";
// import DeleteCard from "@/components/cards/DeleteCard";
// import { setSuggestionList, setNewSuggestion, setDeleteSuggestion, setUpdateSuggestionStatus } from "@/redux-toolkit/slice/suggestionSlice";
// import { getAllSuggestion, deleteSuggestion, updateSuggestionStatus, replyToSuggestion } from "@/service/suggestion";
// import socket from "@/socket/socket";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose,} from "@/components/ui/dialog";
// import { ScrollArea } from "@/components/ui/scroll-area";

// export default function SuggestionPage() {
//   const { toast } = useToast();
//   const dispatch = useAppDispatch();

//   const suggestionList = useAppSelector((state) => state?.suggestion?.suggestionList);

//   const [deleteData, setDeleteData] = useState(null);
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [deleteLoading, setDeleteLoading] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [replyState, setReplyState] = useState<Record<string, string>>({});
//   const [replyLoading, setReplyLoading] = useState<string | null>(null);
//   const [replyModalOpen, setReplyModalOpen] = useState<string | null>(null); // Track which item is being replied to

//   useEffect(() => {
//     socket.on("addSuggestion", (data) => {
//       dispatch(setNewSuggestion(data));
//     });

//     socket.on("deleteSuggestion", (data) => {
//       dispatch(setDeleteSuggestion(data))
//     })

//     return () => {
//       socket.off("addSuggestion");
//       socket.off("deleteSuggestion");
//     }
//   }, []);


//   const handleGetSuggestions = async () => {
//     try {
//       setLoading(true);
//       const res = await getAllSuggestion();
//       if (res.status === 200) {
//         dispatch(setSuggestionList(res?.data?.data || res?.data));
//       }
//     } catch (err) {
//       console.log(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (suggestionList?.length === 0) {
//       handleGetSuggestions();
//     }
//   }, [suggestionList?.length]);

//   const handleUpdateStatus = async (id: string, status: string) => {
//     setLoading(true);
//     let obj = { id, status };

//     try {
//       const res = await updateSuggestionStatus(obj);

//       if (res.status === 200) {
//         toast({ title: "Status Updated", description: "Suggestion status updated successfully" });
//         dispatch(setUpdateSuggestionStatus(res?.data?.data));
//       }
//     } catch (err) {
//       toast({ title: "Update Failed", description: "Failed to update status", variant: "destructive" });
//     } finally {
//       setLoading(false);
//     }
//   };


//   const handleReply = async (id: string) => {
//     const text = replyState[id]?.trim();
//     if (!text) return;
//     setReplyLoading(id);
//     try {
//       const res = await replyToSuggestion({ id, adminReply: text });
//       if (res.status === 200) {
//         toast({ title: "Reply Sent", description: "Your reply was sent to the user." });
//         dispatch(setUpdateSuggestionStatus(res?.data?.data));
//         setReplyState((prev) => ({ ...prev, [id]: "" }));
//         setReplyModalOpen(null); // Close modal instead of inline
//       }
//     } catch (err: any) {
//       toast({ title: "Reply Failed", description: err?.response?.data?.message || err?.message, variant: "destructive" });
//     } finally {
//       setReplyLoading(null);
//     }
//   };


//   const handleDeleteSuggestion = async () => {
//     if (!deleteData?._id) return;

//     setDeleteLoading(true);

//     try {
//       const res = await deleteSuggestion(deleteData?._id);

//       if (res.status === 200) {
//         toast({ title: "Suggestion Deleted Successfully", description: res?.data?.message });

//         setDeleteDialogOpen(false);
//         setDeleteData(null);

//       }
//     } catch (err) {
//       toast({ title: "Delete Failed", description: err?.response?.data?.message || err?.message, variant: "destructive" });
//     } finally {
//       setDeleteLoading(false);
//     }
//   };


//   if (suggestionList?.length === 0 && loading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
//       </div>
//     );
//   }


//   return (
//     <>
//       {/* DELETE MODAL */}
//       <DeleteCard
//         isOpen={deleteDialogOpen}
//         onOpenChange={setDeleteDialogOpen}
//         isLoading={deleteLoading}
//         title="Delete Suggestion"
//         description="Are you sure you want to delete this suggestion?"
//         onConfirm={handleDeleteSuggestion}
//       />

//       {/* REPLY MODAL */}
//       {replyModalOpen && (
//         <Dialog open={!!replyModalOpen} onOpenChange={() => setReplyModalOpen(null)}>
//           <DialogContent className="max-w-md w-full">
//             <DialogHeader>
//               <DialogTitle>Reply to Suggestion</DialogTitle>
//             </DialogHeader>

//             <div className="space-y-4">
//               {/* Reply History */}
//               {suggestionList
//                 .find((item) => item._id === replyModalOpen)
//                 ?.adminReplies?.length > 0 && (
//                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
//                   <p className="text-sm font-semibold text-blue-700 mb-3">
//                     Reply History
//                   </p>
//                   <ScrollArea className="h-auto max-h-48 pr-4">
//                     <div className="space-y-3">
//                       {suggestionList
//                         .find((item) => item._id === replyModalOpen)
//                         ?.adminReplies?.map((reply: any, idx: number) => (
//                           <div key={idx} className="bg-white p-2 rounded border border-blue-100">
//                             <p className="text-sm text-gray-800">{reply.message}</p>
//                             <p className="text-xs text-gray-500 mt-1">
//                               {new Date(reply.createdAt).toLocaleString()}
//                             </p>
//                           </div>
//                         ))}
//                     </div>
//                   </ScrollArea>
//                 </div>
//               )}

//               {/* Reply Input */}
//               <div className="space-y-2">
//                 <label className="text-sm font-medium">Your Reply</label>
//                 <textarea
//                   rows={4}
//                   className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
//                   placeholder="Type your reply here..."
//                   value={replyState[replyModalOpen] || ""}
//                   onChange={(e) =>
//                     setReplyState((prev) => ({
//                       ...prev,
//                       [replyModalOpen]: e.target.value,
//                     }))
//                   }
//                 />
//               </div>

//               {/* Action Buttons */}
//               <div className="flex gap-2 justify-end">
//                 <button
//                   onClick={() => setReplyModalOpen(null)}
//                   className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   disabled={
//                     replyLoading === replyModalOpen ||
//                     !replyState[replyModalOpen]?.trim()
//                   }
//                   onClick={() => handleReply(replyModalOpen)}
//                   className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {replyLoading === replyModalOpen ? "Sending..." : "Send Reply"}
//                 </button>
//               </div>
//             </div>
//           </DialogContent>
//         </Dialog>
//       )}

//       <div className="space-y-4">
//         <h3 className="font-display font-semibold text-lg">
//           Suggestions
//         </h3>

//         {/* LIST */}
//         <div className="space-y-3">
//           {suggestionList?.length > 0 ? (
//             <>
//               {/* ================= DESKTOP TABLE ================= */}
//               <div className="hidden md:block overflow-x-auto">
//                 <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
//                   <thead className="bg-gray-100 text-left text-sm">
//                     <tr>
//                       <th className="p-3">User</th>
//                       <th className="p-3">Email</th>
//                       <th className="p-3">Suggestion</th>
//                       <th className="p-3">Created At</th>
//                       <th className="p-3">Status</th>
//                       <th className="p-3 text-right">Action</th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {suggestionList.map((item) => (
//                       <tr key={item?._id} className="border-t hover:bg-gray-50">
//                         {/* USER */}
//                         <td className="p-3">
//                           <div className="flex items-center gap-2">
//                             <img
//                               src={
//                                 item?.createdBy?.profileImage ||
//                                 "https://via.placeholder.com/40"
//                               }
//                               className="w-10 h-10 rounded-full object-cover border"
//                             />
//                             <span className="text-sm font-medium">
//                               {item?.createdBy?.fullName}
//                             </span>
//                           </div>
//                         </td>

//                         {/* EMAIL */}
//                         <td className="p-3 text-sm">
//                           {item?.createdBy?.email}
//                         </td>

//                         {/* DESCRIPTION */}
//                         <td className="p-3 text-sm text-gray-600 max-w-xs truncate">
//                           {item?.description}
//                         </td>

//                         {/* DATE */}
//                         <td className="p-3 text-sm">
//                           {new Date(item.createdAt).toLocaleString([], {
//                             day: "2-digit",
//                             month: "short",
//                             year: "numeric",
//                             hour: "2-digit",
//                             minute: "2-digit",
//                           })}
//                         </td>

//                         {/* STATUS */}
//                         <td className="p-3">
//                           <div className="flex items-center gap-2">

//                             {/* STATUS BADGE */}
//                             <span
//                               className={`inline-block px-2 py-1 text-xs font-medium rounded-full capitalize
//                                  ${item?.status === "pending"
//                                   ? "bg-yellow-100 text-yellow-800"
//                                   : item?.status === "accepted"
//                                     ? "bg-green-100 text-green-800"
//                                     : "bg-red-100 text-red-800"
//                                 }`}
//                             >
//                               {item?.status}
//                             </span>

//                             {/* ACTION BUTTONS (ONLY PENDING) */}
//                             {item?.status === "pending" && (
//                               <div className="flex items-center gap-1">

//                                 {/* ACCEPT */}
//                                 <button
//                                   onClick={() => handleUpdateStatus(item._id, "accepted")}
//                                   className="w-7 h-7 flex items-center justify-center rounded-full bg-green-100 hover:bg-green-200"
//                                 >
//                                   ✓
//                                 </button>

//                                 {/* REJECT */}
//                                 <button
//                                   onClick={() => handleUpdateStatus(item._id, "rejected")}
//                                   className="w-7 h-7 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200"
//                                 >
//                                   ✕
//                                 </button>

//                               </div>
//                             )}
//                           </div>
//                         </td>

//                         {/* ACTION */}
//                         <td className="p-3">
//                           <div className="flex flex-col items-end gap-2">
//                             {/* Reply button */}
//                             <button
//                               onClick={() => setReplyModalOpen(item._id)}
//                               className="p-1.5 rounded hover:bg-blue-100"
//                               title="Reply to user"
//                             >
//                               <MessageSquareReply className="w-4 h-4 text-blue-500" />
//                             </button>

//                             {/* Delete button */}
//                             <button
//                               onClick={() => {
//                                 setDeleteData(item);
//                                 setDeleteDialogOpen(true);
//                               }}
//                               className="p-1.5 rounded hover:bg-red-100"
//                             >
//                               <Trash className="w-4 h-4 text-red-500" />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* ================= MOBILE VIEW ================= */}
//               <div className="md:hidden space-y-3">
//                 {suggestionList.map((item) => (
//                   <React.Fragment key={item?._id}>
//                   <div
//                     className="border rounded-lg p-3 flex justify-between gap-3"
//                   >
//                     {/* USER + CONTENT */}
//                     <div className="flex gap-3 flex-1">
//                       <img
//                         src={
//                           item?.createdBy?.profileImage ||
//                           "https://via.placeholder.com/40"
//                         }
//                         className="w-10 h-10 rounded-full object-cover"
//                       />

//                       <div className="flex-1">
//                         <p className="text-sm font-medium">
//                           {item?.createdBy?.fullName}
//                         </p>

//                         <p className="text-xs text-gray-500">
//                           {item?.createdBy?.email}
//                         </p>

//                         <p className="text-xs text-gray-600 mt-1 line-clamp-2">
//                           {item?.description}
//                         </p>

//                         <p className="text-xs text-gray-400 mt-1">
//                           {new Date(item.createdAt).toLocaleString([], {
//                             day: "2-digit",
//                             month: "short",
//                             year: "numeric",
//                             hour: "2-digit",
//                             minute: "2-digit",
//                           })}
//                         </p>

//                         <div className="flex items-center gap-2 mt-1">

//                           <span
//                             className={`text-xs px-2 py-1 rounded-full capitalize
//       ${item?.status === "pending"
//                                 ? "bg-yellow-100 text-yellow-800"
//                                 : item?.status === "accepted"
//                                   ? "bg-green-100 text-green-800"
//                                   : "bg-red-100 text-red-800"
//                               }`}
//                           >
//                             {item?.status}
//                           </span>

//                           {item?.status === "pending" && (
//                             <>
//                               <button
//                                 onClick={() => handleUpdateStatus(item._id, "accepted")}
//                                 className="w-6 h-6 flex items-center justify-center rounded-full bg-green-100"
//                               >
//                                 ✓
//                               </button>

//                               <button
//                                 onClick={() => handleUpdateStatus(item._id, "rejected")}
//                                 className="w-6 h-6 flex items-center justify-center rounded-full bg-red-100"
//                               >
//                                 ✕
//                               </button>
//                             </>
//                           )}
//                         </div>
//                       </div>
//                     </div>

//                     {/* ACTION */}
//                     <div className="flex flex-col gap-1">
//                       <button
//                         onClick={() => setReplyModalOpen(item._id)}
//                         className="p-1 rounded hover:bg-blue-100"
//                         title="Reply"
//                       >
//                         <MessageSquareReply className="w-4 h-4 text-blue-500" />
//                       </button>
//                       <button
//                         onClick={() => {
//                           setDeleteData(item);
//                           setDeleteDialogOpen(true);
//                         }}
//                         className="p-1 rounded hover:bg-red-100"
//                       >
//                         <Trash className="w-4 h-4 text-red-500" />
//                       </button>
//                     </div>
//                   </div>
//                   </React.Fragment>
//                 ))}
//               </div>
//             </>
//           ) : (
//             <div className="flex items-center justify-center h-[300px]">
//               <p className="text-muted-foreground text-sm">
//                 No Suggestions Found.
//               </p>
//             </div>
//           )}
//         </div>

//       </div>
//     </>
//   );
// }















import { useEffect, useState } from "react";
import { Users, Loader2, ArrowLeft, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  getAllSuggestion,
  updateSuggestionStatus,
  replyToSuggestion,
} from "@/service/suggestion";
import { useAppDispatch, useAppSelector } from "@/redux-toolkit/customHook/hook";
import {
  setSuggestionList,
  setUpdateSuggestionStatus,
  setNewSuggestion
} from "@/redux-toolkit/slice/suggestionSlice";
import { useNavigate } from "react-router-dom";
import ConfirmCard from "@/components/cards/ConfirmCard";
import socket from "@/socket/socket";

export default function SuggestionPage() {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const suggestionList = useAppSelector(
    (state) => state?.suggestion?.suggestionList
  );

  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const [reply, setReply] = useState("");

  // 🔥 CONFIRM CONTROL
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    id: string;
    status?: "accepted" | "rejected";
    message?: string;
    type: "status" | "reply";
  } | null>(null);

  useEffect(() => {
    socket.on("addSuggestion", (data) => {
      dispatch(setNewSuggestion(data));
    });

    socket.on("updateSuggestionStatus", (data) => {
      dispatch(setUpdateSuggestionStatus(data));
      if (selected?._id === data._id) {
        setSelected(data);
      }
    });

    socket.on("suggestionReply", (data) => {
      dispatch(setUpdateSuggestionStatus(data));
      if (selected?._id === data._id) {
        setSelected(data);
      }
    });

    return () => {
      socket.off("addSuggestion");
      socket.off("updateSuggestionStatus");
      socket.off("suggestionReply");
    };
  }, [selected]);

  // ================= FETCH =================
  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const res = await getAllSuggestion();
      if (res.status === 200) {
        dispatch(setSuggestionList(res?.data?.data));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  // ================= STATUS CLICK =================
  const askStatusConfirm = (id: string, status: "accepted" | "rejected") => {
    setPendingAction({
      id,
      status,
      type: "status",
    });
    setConfirmOpen(true);
  };

  // ================= REPLY CLICK =================
  const askReplyConfirm = () => {
    if (!selected?._id || !reply.trim()) return;

    setPendingAction({
      id: selected._id,
      message: reply,
      type: "reply",
    });
    setConfirmOpen(true);
  };

  // ================= CONFIRM ACTION =================
  const handleConfirm = async () => {
    if (!pendingAction) return;

    try {
      setConfirmLoading(true);

      // ===== STATUS =====
      if (pendingAction.type === "status") {
        const res = await updateSuggestionStatus({
          id: pendingAction.id,
          status: pendingAction.status,
        });

        if (res.status === 200) {
          dispatch(setUpdateSuggestionStatus(res?.data?.data));
          toast({
            title: `Suggestion ${pendingAction.status}`,
            description: res?.data?.message,
          });
        }
      }

      // ===== REPLY =====
      if (pendingAction.type === "reply") {
        const res = await replyToSuggestion({
          id: pendingAction.id,
          userId: user?._id,
          adminReply: pendingAction.message,
        });

        if (res.status === 200) {
          dispatch(setUpdateSuggestionStatus(res?.data?.data));
          setReply("");
          toast({
            title: "Reply sent",
          });
        }
      }

      setConfirmOpen(false);
      setPendingAction(null);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message,
        variant: "destructive",
      });
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <>
      {/* ================= CONFIRM CARD ================= */}
      <ConfirmCard
        isOpen={confirmOpen}
        onOpenChange={setConfirmOpen}
        isLoading={confirmLoading}
        onConfirm={handleConfirm}
        title={
          pendingAction?.type === "status"
            ? pendingAction?.status === "accepted"
              ? "Accept Suggestion"
              : "Reject Suggestion"
            : "Send Reply"
        }
        description={
          pendingAction?.type === "status"
            ? "Are you sure you want to update status?"
            : "Are you sure you want to send this reply?"
        }
        buttonName="Confirm"
      />

      {/* ================= PAGE ================= */}
      <div className="min-h-screen flex flex-col bg-background">

        {/* HEADER */}
        <div className="flex items-center gap-3 border-b p-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Users className="w-5 h-5 text-primary" />
          <h1 className="font-bold text-lg">Suggestions</h1>
        </div>

        {/* LIST */}
        <ScrollArea className="flex-1 p-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">

              {suggestionList?.map((item: any) => (
                <div
                  key={item._id}
                  onClick={() => setSelected(item)}
                  className="border rounded-lg p-4 flex justify-between items-center cursor-pointer hover:bg-muted"
                >
                  <div className="flex-1">
                    <p className="font-medium">
                      {item?.createdBy?.fullName}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {item?.suggestion}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">

                    <span className={`text-xs px-2 py-1 rounded-full capitalize
                      ${item.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : item.status === "accepted"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                      {item.status}
                    </span>

                    {/* ACCEPT / REJECT */}
                    {item.status === "pending" && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            askStatusConfirm(item._id, "accepted");
                          }}
                          className="text-xs px-2 py-1 bg-green-100 rounded"
                        >
                          Accept
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            askStatusConfirm(item._id, "rejected");
                          }}
                          className="text-xs px-2 py-1 bg-red-100 rounded"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}

            </div>
          )}
        </ScrollArea>

        {/* ================= MODAL ================= */}
        {selected && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="w-full max-w-lg bg-card border shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
              
              {/* Header */}
              <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {selected?.createdBy?.fullName?.[0]}
                  </div>
                  <div>
                    <h2 className="font-bold text-base leading-none mb-1">
                      {selected?.createdBy?.fullName}
                    </h2>
                    <p className="text-xs text-muted-foreground">Suggestion Details</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelected(null)} 
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-6">
                  {/* Original Suggestion */}
                  <div className="flex flex-col gap-1.5 max-w-[85%]">
                    <div className="p-3 rounded-2xl rounded-tl-none bg-muted text-sm shadow-sm border">
                      <p className="font-semibold text-xs text-muted-foreground mb-1">User Suggestion</p>
                      {selected?.suggestion}
                    </div>
                    <span className="text-[10px] text-muted-foreground ml-1">
                      {new Date(selected?.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-muted-foreground/20"></span>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                      <span className="bg-card px-2 text-muted-foreground font-semibold">Replies</span>
                    </div>
                  </div>

                  {/* Replies */}
                  <div className="space-y-4">
                    {selected?.adminReplies?.length > 0 ? (
                      selected.adminReplies.map((r: any, i: number) => {
                        const isMe = r.userId === user?._id;
                        return (
                          <div key={i} className={`flex flex-col gap-1.5 ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className={`p-3 rounded-2xl text-sm shadow-sm max-w-[85%] border ${
                              isMe 
                                ? 'bg-primary text-primary-foreground rounded-tr-none' 
                                : 'bg-card text-foreground rounded-tl-none'
                            }`}>
                              <p className="font-semibold text-[10px] opacity-70 mb-1">
                                {isMe ? 'Admin (You)' : 'User Reply'}
                              </p>
                              {r.message}
                            </div>
                            <span className="text-[10px] text-muted-foreground mx-1">
                              {new Date(r.createdAt).toLocaleString()}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-sm text-muted-foreground italic">No replies yet. Start the conversation!</p>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t bg-muted/10">
                <div className="flex gap-2 items-end">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    className="flex-1 min-h-[44px] max-h-32 bg-background border rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                    placeholder="Type your reply..."
                    rows={1}
                  />
                  <button
                    onClick={askReplyConfirm}
                    disabled={!reply.trim()}
                    className="h-11 px-5 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}