import { useEffect, useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, Users } from 'lucide-react';
import { type Post } from '@/data/mockData';
import { CommentSection } from './CommentSection';
import { FriendButton } from '@/components/connections/FriendButton';
import { useConnections } from '@/hooks/useConnections';
import { likeAnUnLikePost, addCommentPost, likeAnUnLikeComment, replyToComment } from "@/service/post";
import { useToast } from '@/hooks/use-toast';
import { setPostLikeAnUnLike, setPostComment, setPostLikeAnUnLikeComment, setPostReplyComment } from "@/redux-toolkit/slice/postSlice";
import { useAppDispatch } from '@/redux-toolkit/customHook/hook';
import { useNavigate } from 'react-router-dom';
import ShareModal from "./ShareCard";


export function PostCard({ post }) {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const user = JSON.parse(localStorage.getItem("user"));
  const [liked, setLiked] = useState(post?.likes || []);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const { getStatus } = useConnections();
  const status = getStatus(post?.user?.id);
  const navigate = useNavigate();
   const [shareModelOpen, setShareModelOpen] = useState(false);
  const handleLike = async (postId: string) => {
    if (!user?._id || !postId) return;
    let obj = { userId: user?._id, postId: postId };
    try {
      const res = await likeAnUnLikePost(obj);
      console.log(res);
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
      console.log(res)
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
      console.log(res)
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
    console.log(obj);
    try {
      const res = await replyToComment(obj);
      console.log(res);
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
    <ShareModal isOpen={shareModelOpen} onOpenChange={setShareModelOpen} post={post} />
    <div className="bg-card rounded-xl shadow-card mb-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { navigate(`/profile/${post?.createdBy?._id}`) }}>
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
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground">
            <MoreHorizontal className="h-5 w-5" />
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

          {/* Important Badge */}
          {post.important && (
            <div className="absolute top-2 left-2 bg-white rounded-full p-1 shadow-md">
              <Heart className="h-5 w-5 text-red-500" />
            </div>
          )}

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
