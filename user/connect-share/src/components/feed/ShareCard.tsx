import React, { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from '@/redux-toolkit/customHook/hook';
import { getChatUsers } from "@/service/chat";
import { setUserChatList } from '@/redux-toolkit/slice/chatSlice';
import { sharePost } from "@/service/post";
import { useToast } from "@/hooks/use-toast";

const ShareModal = ({ isOpen, onOpenChange, post }) => {
    const { toast } = useToast();
    const user = JSON.parse(localStorage.getItem("user"));

    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<"single" | "group">("single");
    const [search, setSearch] = useState("");

    const dispatch = useAppDispatch();
    const friendList = useAppSelector((state) => state?.chat?.userChatList);

    useEffect(() => {
        if (!isOpen) setSelectedUsers([]);
    }, [isOpen]);

    const toggleSelectUser = (id: string) => {
        setSelectedUsers(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id]
        );
    };

    // ---------------- SHARE POST ----------------
    const handleSharePost = async () => {
        if (!user?._id || !post?._id || !selectedUsers.length) return;

        try {
            const obj = {
                fromId: user?._id,
                toId: selectedUsers,
                postId: post?._id,
                activeTab: activeTab,

            };
            console.log(obj)
            const res = await sharePost(obj);

            if (res.status === 200) {
                toast({ title: "Post Shared", description: res?.data?.message });
                onOpenChange(false);
            }
        } catch (err: any) {
            toast({
                title: "Share Failed",
                description: err?.response?.data?.message || err?.message,
                variant: "destructive"
            });
        }
    };

    // ---------------- FETCH USERS ----------------
    const handleGetFriendList = async () => {
        if (!user?._id) return;
        try {
            const res = await getChatUsers(user?._id);
            if (res.status === 200) {
                dispatch(setUserChatList(res?.data?.friends));
            }
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        if (isOpen && (!friendList?.length || user?._id)) {
            handleGetFriendList();
        }
    }, [isOpen, user?._id]);

    // ---------------- FILTER DATA ----------------
    const filteredList = useMemo(() => {
        return friendList
            ?.filter(item => item.isGroup === (activeTab === "group"))
            ?.filter(item => {
                if (!search) return true;

                const name = item.isGroup
                    ? item?.group?.title
                    : item?.friend?.fullName;

                return name?.toLowerCase().includes(search.toLowerCase());
            });
    }, [friendList, activeTab, search]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
        >
            <div
                className="bg-white rounded-xl shadow-lg w-11/12 max-w-md max-h-[80vh] flex flex-col relative"
                onClick={e => e.stopPropagation()}
            >
                {/* CLOSE */}
                <button
                    onClick={() => onOpenChange(false)}
                    className="absolute top-3 right-3 text-gray-500"
                >
                    ✕
                </button>

                {/* HEADER */}
                <div className="px-4 pt-4 pb-2 border-b">
                    {post?.title && (
                        <span className="text-lg font-semibold">{post.title}</span>
                    )}

                    {post?.description && (
                        <p className="text-sm text-gray-500">{post.description}</p>
                    )}

                    <p className="mt-2 text-sm font-semibold">Share with</p>

                    {/* SEARCH */}
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search..."
                        className="w-full mt-2 px-3 py-2 border rounded-md text-sm"
                    />

                    {/* TABS */}
                    <div className="flex mt-3 gap-2">
                        <button
                            onClick={() => setActiveTab("single")}
                            className={`flex-1 py-1 rounded-md text-sm ${activeTab === "single"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100"
                                }`}
                        >
                            Single
                        </button>

                        <button
                            onClick={() => setActiveTab("group")}
                            className={`flex-1 py-1 rounded-md text-sm ${activeTab === "group"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100"
                                }`}
                        >
                            Group
                        </button>
                    </div>
                </div>

                {/* LIST */}
                <div className="flex-1 overflow-y-auto px-4 py-2">

                    {/* EMPTY STATE */}
                    {filteredList?.length === 0 && (
                        <p className="text-center text-sm text-gray-400 mt-4">
                            No results found
                        </p>
                    )}

                    {/* ITEMS */}
                    {filteredList?.map(item => (
                        <div
                            key={item?.chatId}
                            className="flex items-center justify-between py-2 border-b"
                        >
                            <div className="flex items-center gap-3">
                                <img
                                    src={
                                        item.isGroup
                                            ? item?.group?.images?.[0]
                                            : item?.friend?.profileImage
                                    }
                                    className="h-10 w-10 rounded-full object-cover"
                                />

                                <span>
                                    {item.isGroup
                                        ? item?.group?.title
                                        : item?.friend?.fullName}
                                </span>
                            </div>

                            <input
                                type="checkbox"
                                checked={selectedUsers.includes(
                                    item.isGroup ? item.chatId : item.friend?._id
                                )}
                                onChange={() =>
                                    toggleSelectUser(
                                        item.isGroup ? item.chatId : item.friend?._id
                                    )
                                }
                                className="h-5 w-5 accent-blue-500"
                            />
                        </div>
                    ))}
                </div>

                {/* FOOTER */}
                <div className="px-4 py-3 border-t">
                    <button
                        onClick={handleSharePost}
                        disabled={!selectedUsers.length}
                        className="w-full py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
                    >
                        Share
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;