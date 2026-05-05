import { useEffect, useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, Users, Pin, MoreVertical } from 'lucide-react';
import { type Post } from '@/data/mockData';
import { CommentSection } from './CommentSection';
import { FriendButton } from '@/components/connections/FriendButton';
import { useConnections } from '@/hooks/useConnections';
import { likeAnUnLikePost, addCommentPost, likeAnUnLikeComment, replyToComment, deletePostByUser } from "@/service/post";
import { useToast } from '@/hooks/use-toast';
import { setPostLikeAnUnLike, setPostComment, setPostLikeAnUnLikeComment,setDeletePostFromList, setPostReplyComment } from "@/redux-toolkit/slice/postSlice";
import { useAppDispatch } from '@/redux-toolkit/customHook/hook';
import { useNavigate } from 'react-router-dom';
import ShareModal from "./ShareCard";
import DeleteCard from "@/components/card/DeleteCard";
import socket from '@/socket/socket';


export function PostCard({ post }) {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const user = JSON.parse(localStorage.getItem("user"));
  const [liked, setLiked] = useState(post?.likes || []);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletePostData, setDeletePostData] = useState(null);

  const { getStatus } = useConnections();
  const status = getStatus(post?.user?.id);
  const navigate = useNavigate();
   const [shareModelOpen, setShareModelOpen] = useState(false);

   useEffect(() => {
      socket.on("postDeleted", (data) => {
                dispatch(setDeletePostFromList(data))
             });

            return () => {
                socket.off("postDeleted");
            }
   },[])

   const handleDeletePost = async() => {
    let obj = { postId: post?._id, userId: user?._id }
    try {
      setDeleteLoading(true);
      const res = await deletePostByUser(obj);
      if (res?.status === 200) {
        toast({ title: "Post Delete.", description: res?.data?.message });
        // dispatch(setPostComment({ postId: postId, text: newComment, fullName: user?.fullName, userId: user?._id, createdAt: res?.data?.comment?.createdAt }))
        dispatch(setDeletePostFromList({ postId: post?._id , userId: user?._id }));
        setDeleteDialogOpen(false);
        setDeletePostData(null);
      }
    } catch (err) {
      console.log(err);
      toast({ title: "Post Delete Failed.", description: err?.response?.data?.message || err?.message, variant: "destructive" })
    }finally{
      setDeleteLoading(false);
    }
   };


  const handleLike = async (postId: string) => {
    if (!user?._id || !postId) return;
    let obj = { userId: user?._id, postId: postId };
    try {
      const res = await likeAnUnLikePost(obj);
      if (res.status === 200) {
        toast({ title: "Post Like.", description: res?.data?.message });
        dispatch(setPostLikeAnUnLike(obj));
        setLiked(prevLikes => {
          if (prevLikes?.includes(user?._id)) {
            // remove userId
            return prevLikes?.filter(id => id !== user?._id);
          } else {
            // add userId
            return [...prevLikes, user?._id];
          }
        });
      }
    }
    catch (err) {
      console.log(err);
      toast({ title: "Post Like Failed.", description: err?.response?.data?.message || err?.message, variant: "destructive" })
    }
  };


  const handleComment = async (postId: string) => {
    let obj = { postId: postId, text: newComment, userId: user?._id }
    try {
      const res = await addCommentPost(obj);
      if (res?.status === 200) {
        toast({ title: "Comment Add.", description: res?.data?.message });
        dispatch(setPostComment({ postId: postId, text: newComment, fullName: user?.fullName, userId: user?._id, createdAt: res?.data?.comment?.createdAt }))
        setNewComment("");
      }
    } catch (err) {
      console.log(err);
      toast({ title: "Post Comment Failed.", description: err?.response?.data?.message || err?.message, variant: "destructive" })
    }
  }


  const handleLikeAndUnLikeComment = async (postId: string, commentId: string) => {
    let obj = { postId: postId, commentId: commentId, userId: user?._id }
    try {
      const res = await likeAnUnLikeComment(obj);
      if (res?.status === 200) {
        toast({ title: "Comment Like.", description: res?.data?.message });
        dispatch(setPostLikeAnUnLikeComment({ postId: postId, commentId: commentId, userId: user?._id }))
      }
    } catch (err) {
      console.log(err);
      toast({ title: "Post Comment Like Failed.", description: err?.response?.data?.message || err?.message, variant: "destructive" })
    }
  };


  const handleAddCommentReply = async (postId: string, commentId: string, text: string) => {
    let obj = { postId: postId, commentId: commentId, text: text, userId: user?._id, fullName: user?.fullName };
    try {
      const res = await replyToComment(obj);
      if (res?.status === 200) {
        toast({ title: "Comment Reply Add.", description: res?.data?.message });
        dispatch(setPostReplyComment(obj))
      }
    }
    catch (err) {
      console.log(err);
      toast({ title: "Post Comment Reply Failed.", description: err?.response?.data?.message || err?.message, variant: "destructive" })
    }
  }

  return (
    <>
      <DeleteCard
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        isLoading={deleteLoading}
        buttonName="Delete"
        title={`Delete Post: ${deletePostData?.title}`}
        description={`Are you sure you want to delete the post "${deletePostData?.title}"? This action cannot be undone.`}
        onConfirm={handleDeletePost}
      />

    <ShareModal isOpen={shareModelOpen} onOpenChange={setShareModelOpen} post={post} />
    <div className="bg-card rounded-xl shadow-card mb-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className={`flex items-center gap-3 ${post?.createdBy?.role !== "admin" ? "cursor-pointer" : ""}`}  onClick={() => {if (post?.createdBy?.role !== "admin") { navigate(`/profile/${post?.createdBy?._id}`)} }}>
          <div className="relative">
            <img
              src={post?.createdBy?.profileImage || "https://via.placeholder.com/40"}
              alt={post?.createdBy?.fullName || post?.createdBy?.name || "User Avatar"}
              className="h-10 w-10 rounded-full object-cover"
            />
            {status === 'friends' && (
              <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center" title="Friend">
                <Users className="h-2.5 w-2.5 text-primary" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-heading font-semibold text-sm text-foreground">{post?.createdBy?.fullName || post?.createdBy?.name}</p>
              {status === 'friends' && (
                <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">Friend</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {post?.createdBy?.occupation || "Admin"} · {new Date(post?.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Edit/Delete */}
        <div className={`flex items-center gap-1 ${post?.createdBy?._id === user?._id ? "cursor-pointer" : ""}`} onClick={() => {if(post?.createdBy?._id === user?._id){setDeletePostData(post);setDeleteDialogOpen(true)} else{};}}>
          <button className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Post Text */}
      {post?.description && (
        <p className="px-4 pb-3 text-sm text-foreground leading-relaxed">
          {post.description.length > 100 ? post.description.slice(0, 100) + "…" : post.description}
        </p>
      )}

      {/* Notes (Text) */}
      {post?.notes && (
        <p className="px-4 pb-3 text-sm text-foreground leading-relaxed">
          {post.notes}
        </p>
      )}

      {/* Media: Image / Video */}
      {post?.images?.length > 0 && (
        <div className="relative">
          <div className="overflow-hidden rounded-t">
            {post.images.map((media, i) => (
              <div key={i} className={`${i === currentIndex ? "block" : "hidden"}`}>
                {media.endsWith(".mp4") ? (
                  <video
                    src={media}
                    className="w-full aspect-video object-cover"
                    controls
                  />
                ) : (
                  <img
                    src={media}
                    className="w-full aspect-video object-cover"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Pinned / Important Badge */}
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            {post.isPinned && (
              <div className="bg-blue-600 text-white rounded-full p-1.5 shadow-lg flex items-center justify-center border border-white/20" title="Pinned by Admin">
                <Pin className="h-4 w-4 fill-current" />
              </div>
            )}
            {post.important && (
              <div className="bg-white rounded-full p-1 shadow-md flex items-center justify-center">
                <Heart className="h-5 w-5 text-red-500" />
              </div>
            )}
          </div>

          {/* Slider Buttons */}
          {post.images.length > 1 && (
            <>
              <button
                onClick={() =>
                  setCurrentIndex((prev) =>
                    prev === 0 ? post.images.length - 1 : prev - 1
                  )
                }
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-2 rounded"
              >
                ‹
              </button>

              <button
                onClick={() =>
                  setCurrentIndex((prev) =>
                    prev === post.images.length - 1 ? 0 : prev + 1
                  )
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-2 rounded"
              >
                ›
              </button>
            </>
          )}
        </div>
      )}


      {/* Stats */}
      <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
        <span>{liked?.length || 0} likes</span>
        <div className="flex gap-3">
          <button onClick={() => setShowComments(!showComments)} className="hover:underline">
            {post.comments?.length || 0} comments
          </button>
          <span>{post.shares || 0} shares</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center border-t border-border mx-4">
        <button
          onClick={() => { handleLike(post?._id) }}
          className={`flex items-center justify-center gap-2 flex-1 py-2.5 text-sm font-medium transition-colors ${liked?.includes(user?._id) ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          <Heart className={`h-5 w-5 ${liked?.includes(user?._id) ? 'fill-red-500 text-red-500' : ''}`} />
          <span className="hidden sm:inline">Like</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center justify-center gap-2 flex-1 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="hidden sm:inline">Comment</span>
        </button>
        <button onClick={()=> {setShareModelOpen(true);}} className="flex items-center justify-center gap-2 flex-1 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <Share2 className="h-5 w-5" />
          <span className="hidden sm:inline">Share</span>
        </button>
        <button
          onClick={() => setSaved(!saved)}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 text-sm font-medium transition-colors ${saved ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          <Bookmark className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Comments */}
      {showComments && <CommentSection handleAddCommentReply={(parentCommentId, text) => handleAddCommentReply(post?._id, parentCommentId, text)} handleLikeAndUnLikeComment={(commentId) => handleLikeAndUnLikeComment(post?._id, commentId)} comments={post.comments} newComment={newComment} setNewComment={setNewComment} onSubmit={() => { handleComment(post?._id) }} />}
    </div>
    </>
  );
}
