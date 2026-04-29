// import { useEffect, useState } from 'react';
// import { Users, UserPlus, Loader2 } from 'lucide-react';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription
// } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { getSuggestedUsers, sendRequest } from '@/service/friendRequest';
// import socket from '@/socket/socket';
// import { useToast } from '@/hooks/use-toast';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { getAllSuggestion } from '@/service/suggestion';
// import { useAppDispatch, useAppSelector } from '@/redux-toolkit/customHook/hook';
// import { setSuggestionList } from '@/redux-toolkit/slice/suggestionSlice';

// interface SuggestionModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   userId: string;
// }

// export function SuggestionModal({ isOpen, onClose, userId }: SuggestionModalProps) {
//   const { toast } = useToast();
//   const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [requesting, setRequesting] = useState<string | null>(null);
//   const dispatch = useAppDispatch();
//   const suggestionList = useAppSelector((state) => state?.suggestion?.suggestionList);

//   const fetchSuggestions = async () => {
//     if (!userId) return;
//     setLoading(true);
//     try {
//       const res = await getAllSuggestion(userId);
//       console.log(res);
//       if (res.status === 200) {
//         dispatch(setSuggestionList(res?.data?.data))
//       }
//     } catch (err) {
//       console.error('Error fetching suggestions:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (suggestionList.length === 0) {
//       fetchSuggestions();
//     }
//   }, [suggestionList]);

//   const handleSendRequest = async (targetId: string) => {
//     if (!userId || !targetId) return;
//     setRequesting(targetId);
//     try {
//       const res = await sendRequest({ fromId: userId, toId: targetId });
//       if (res.status === 201) {
//         toast({ title: "Request Sent Successfully", description: res?.data?.message });
//         socket.emit("unSeenFriendRequest", { from: userId, to: targetId });
//         // Refresh local list to show the update (or remove the user)
//         setSuggestedUsers(prev => prev.filter(u => u._id !== targetId));
//       }
//     } catch (err: any) {
//       console.error('Error sending request:', err);
//       toast({
//         title: "Send Request Failed",
//         description: err?.response?.data?.message || err?.message,
//         variant: "destructive"
//       });
//     } finally {
//       setRequesting(null);
//     }
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-[425px] overflow-hidden p-0 gap-0 border-none bg-card/95 backdrop-blur-xl shadow-2xl">
//         <DialogHeader className="p-6 pb-4">
//           <DialogTitle className="text-xl font-bold flex items-center gap-2">
//             <Users className="h-5 w-5 text-primary" />
//             Suggestions
//           </DialogTitle>
//           <DialogDescription className="text-sm text-muted-foreground">
//             Connect with people you may know in your community.
//           </DialogDescription>
//         </DialogHeader>

//         <ScrollArea className="max-h-[60vh] px-6 pb-6">
//           <div className="space-y-4">
//             {loading ? (
//               <div className="flex flex-col items-center justify-center py-10 gap-2">
//                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
//                 <p className="text-sm text-muted-foreground">Finding people...</p>
//               </div>
//             ) : suggestionList?.length > 0 ? (
//               suggestionList?.map((user) => (
//                 <div key={user._id} className="flex items-center gap-4 group transition-all duration-300">
//                   <div className="relative">
//                     <img
//                       src={user?.profileImage}
//                       alt={user?.fullName}
//                       className="h-12 w-12 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary/20 transition-all"
//                     />
//                     <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-card" />
//                   </div>

//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-semibold text-foreground truncate">{user?.fullName}</p>
//                     <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
//                       <Users className="h-3 w-3" /> {user?.mutualFriendsCount || 0} mutual connections
//                     </p>
//                   </div>

//                   <Button
//                     size="sm"
//                     className="h-9 px-4 rounded-full gradient-primary hover:opacity-90 transition-opacity disabled:opacity-50"
//                     onClick={() => handleSendRequest(user._id)}
//                     disabled={requesting === user._id}
//                   >
//                     {requesting === user._id ? (
//                       <Loader2 className="h-4 w-4 animate-spin" />
//                     ) : (
//                       <>
//                         <UserPlus className="h-4 w-4 mr-2" />
//                         Add
//                       </>
//                     )}
//                   </Button>
//                 </div>
//               ))
//             ) : (
//               <div className="flex flex-col items-center justify-center py-10 text-center">
//                 <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
//                   <Users className="h-6 w-6 text-muted-foreground" />
//                 </div>
//                 <p className="text-sm font-medium text-foreground">No suggestions found</p>
//                 <p className="text-xs text-muted-foreground mt-1">Check back later for new connections</p>
//               </div>
//             )}
//           </div>
//         </ScrollArea>
//       </DialogContent>
//     </Dialog>
//   );
// }















import { useEffect, useState } from 'react';
import { Users, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAllSuggestion } from '@/service/suggestion';
import { useAppDispatch, useAppSelector } from '@/redux-toolkit/customHook/hook';
import { setSuggestionList } from '@/redux-toolkit/slice/suggestionSlice';

interface SuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function SuggestionModal({ isOpen, onClose, userId }: SuggestionModalProps) {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const suggestionList = useAppSelector((state) => state?.suggestion?.suggestionList);

  // ✅ FETCH SUGGESTIONS EVERY TIME MODAL OPENS (to get latest data from server)
  useEffect(() => {
    if (!isOpen || !userId) return;

    setLoading(true);
    const fetchSuggestions = async () => {
      try {
        const res = await getAllSuggestion(userId);
        if (res.status === 200) {
          dispatch(setSuggestionList(res?.data?.data));
        }
      } catch (err: any) {
        console.error('Error fetching suggestions:', err);
        toast({
          title: "Error",
          description: err?.message || "Failed to fetch data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [isOpen, userId, dispatch, toast]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] overflow-hidden p-0 gap-0 border-none bg-card/95 backdrop-blur-xl shadow-2xl">

        {/* HEADER */}
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Suggestions
          </DialogTitle>

          <DialogDescription className="text-sm text-muted-foreground">
            Your submitted suggestions and their status.
          </DialogDescription>
        </DialogHeader>

        {/* LIST */}
        <ScrollArea className="max-h-[60vh] px-6 pb-6">
          <div className="space-y-4">

            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Loading suggestions...
                </p>
              </div>
            ) : suggestionList?.length > 0 ? (

              suggestionList.map((item: any) => {
                const getStatusStyle = (status: string) => {
                  switch (status) {
                    case "pending":
                      return "bg-yellow-100 text-yellow-600";
                    case "accepted":
                      return "bg-green-100 text-green-600";
                    case "rejected":
                      return "bg-red-100 text-red-600";
                    default:
                      return "bg-gray-100 text-gray-600";
                  }
                };

                return (
                  <div
                    key={item._id}
                    className="flex flex-col gap-2 py-2 border-b"
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* DESCRIPTION */}
                      <p className="text-sm font-medium text-foreground truncate">
                        {item?.description}
                      </p>

                      {/* STATUS BADGE */}
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium capitalize whitespace-nowrap ${getStatusStyle(
                          item?.status
                        )}`}
                      >
                        {item?.status}
                      </span>
                    </div>

                    {/* ADMIN REPLY */}
                    {item?.adminReplies?.length > 0 ? (
                      <div className="space-y-2 p-3 bg-blue-50 border border-blue-100 rounded-md">
                        <p className="text-xs font-semibold text-blue-600">Admin replies</p>
                        {item.adminReplies.map((reply: any, idx: number) => (
                          <div key={idx} className="space-y-1">
                            <p className="text-xs text-blue-800">{reply.message}</p>
                            <p className="text-[10px] text-blue-500">
                              {new Date(reply.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : item?.adminReply ? (
                      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-md p-2">
                        <span className="text-xs font-semibold text-blue-600 whitespace-nowrap">Admin:</span>
                        <p className="text-xs text-blue-800">{item.adminReply}</p>
                      </div>
                    ) : null}
                  </div>
                );
              })

            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>

                <p className="text-sm font-medium text-foreground">
                  No suggestions found
                </p>

                <p className="text-xs text-muted-foreground mt-1">
                  You haven’t submitted any suggestions yet
                </p>
              </div>
            )}

          </div>
        </ScrollArea>

      </DialogContent>
    </Dialog>
  );
}