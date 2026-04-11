import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PostDialog from "@/components/forms/PostDialog";
import { getAllPost, deletePost } from "@/service/post";
import { Plus, Calendar, MapPin, Users, Clock, Edit, Trash, Heart, HeartCrack } from "lucide-react";
import DeleteCard from "@/components/cards/DeleteCard";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/redux-toolkit/customHook/hook";
import { setPostList } from "@/redux-toolkit/slice/postSlice";


export default function AnnouncementsPage() {
    const { toast } = useToast();
    const [postDialogOpen, setPostDialogOpen] = useState(false);
    const [postListRefresh, setPostListRefresh] = useState(false);
    const [initialData, setIntialData] = useState(null);
    const [deletePosts, setDeletePosts] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const dispatch = useAppDispatch();
    const postList = useAppSelector((state)=> state?.post?.postList);


    const handleDeletePost = async () => {
        try {
            setDeleteLoading(true);
             const res = await  deletePost(deletePosts?._id);

             if(res?.status === 200){
              toast({title:"User Deleted Successfully.", description:res?.data?.message});
              setPostListRefresh(true);
              setDeleteDialogOpen(false);
              setDeletePosts(null);
             }
        }
        catch (err) {
            console.log(err);
            toast({ title: "User Deleted Failed.", description: err?.response?.data?.message || err?.message, variant: "destructive" })
        } finally {
            setDeleteLoading(false);
        }

    }


    const handleGetPosts = async () => {
        try {
            const res = await getAllPost();
            console.log(res)
            if (res.status === 200) {
                dispatch(setPostList(res?.data?.posts));
                setPostListRefresh(false);
            }
        }
        catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        if(postList?.length === 0 || postListRefresh){
        handleGetPosts();
        }
    }, [postList?.length, postListRefresh])

    return (
        <>
            <DeleteCard
                isOpen={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                isLoading={deleteLoading}
                buttonName="Delete"
                title={`Delete Post: ${deletePosts?.title}`} // Dynamic title
                description={`Are you sure you want to delete the post "${deletePosts?.title}"? This action cannot be undone.`} // Dynamic description
                onConfirm={handleDeletePost}
            />

            <PostDialog isOpen={postDialogOpen} onOpenChange={setPostDialogOpen} initialData={initialData} setPostListRefresh={setPostListRefresh} />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h3 className="font-display font-semibold text-lg">Post Management</h3>
                    <Button
                        className="gradient-gold text-secondary-foreground font-semibold"
                        onClick={() => { setIntialData(null); setPostDialogOpen(true); }}
                    >
                        <Plus className="h-4 w-4 mr-1" /> Post
                    </Button>
                </div>

                {/* Grid Container */}
                <div className="max-w-6xl mx-auto px-4">
                    {postList?.length > 0 ? (
                        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {postList.map((post) => (
                                <Card
                                    key={post._id}
                                    className="shadow-card hover:shadow-elevated transition-shadow relative flex flex-col"
                                >
                                    {/* Image Section */}
                                    <div className="relative w-full h-48">
                                        {post.images?.length > 0 && (
                                            <div className="w-full rounded-t overflow-hidden">
                                                {(() => {
                                                    const url = post.images[0]; // pehli file
                                                    const extension = url.split(".").pop()?.toLowerCase();
                                                    const isImage = ["jpg", "jpeg", "png", "webp", "gif"].includes(extension || "");
                                                    const isVideo = ["mp4", "webm", "mov"].includes(extension || "");
                                                    const isAudio = ["mp3", "wav", "ogg"].includes(extension || "");

                                                    if (isImage) {
                                                        return (
                                                            <img
                                                                src={url}
                                                                alt={post.title}
                                                                className="w-full h-[200px] object-cover rounded-t"
                                                            />
                                                        );
                                                    }

                                                    if (isVideo) {
                                                        return (
                                                            <video
                                                                src={url}
                                                                controls
                                                                className="w-full h-[200px] object-cover rounded-t"
                                                                autoPlay
                                                            />
                                                        );
                                                    }

                                                    if (isAudio) {
                                                        return (
                                                            <audio
                                                                src={url}
                                                                controls
                                                                className="w-full mt-2"
                                                            />
                                                        );
                                                    }

                                                    return null;
                                                })()}
                                            </div>
                                        )}

                                        {/* Important Heart Icon on Image */}
                                        {post.important && (
                                            <div className="absolute top-2 left-2 bg-white/70 rounded-full p-1">
                                                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                                                    <Heart className="h-4 w-4 text-red-500" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Edit/Delete Buttons on Image */}
                                        <div className="absolute top-2 right-2 flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setIntialData(post);
                                                    setPostDialogOpen(true);
                                                }}
                                                className="p-1 rounded hover:bg-gray-100"
                                            >
                                                <Edit className="w-4 h-4 md:w-5 md:h-5" />
                                            </button>
                                            <button className="p-1 rounded hover:bg-red-100" onClick={()=>{setDeletePosts(post);setDeleteDialogOpen(true);}}>
                                                <Trash className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <CardContent className="p-4 flex flex-col h-full">
                                        {/* Title */}
                                        <h3 className="font-display font-semibold text-lg mb-1">{post.title}</h3>

                                        {/* Description */}
                                        <p className="text-sm text-muted-foreground mb-3">{<p className="text-sm text-muted-foreground mb-4">
                                            {post.description && post.description.length > 50
                                                ? post.description.slice(0, 50) + "…"
                                                : post.description}
                                        </p>}</p>

                                        {/* Post Details */}
                                        <div className="mt-auto spacEe-y-2 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-3.5 w-3.5 text-secondary" />
                                                {post.type}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3.5 w-3.5 text-secondary" />
                                                {new Date(post.createdAt)?.toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <HeartCrack className="h-3.5 w-3.5 text-secondary" />
                                                {post?.likes?.length} Likes
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-3.5 w-3.5 text-secondary" />
                                                {post?.comments?.length} Comments
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64">
                            <p className="text-center text-muted-foreground">No Data Found.</p>
                        </div>
                    )}
                </div>



            </div>
        </>
    );
}
