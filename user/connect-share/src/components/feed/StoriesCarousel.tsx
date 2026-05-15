// import { getAllUser } from "@/service/auth";
// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAppDispatch, useAppSelector } from '@/redux-toolkit/customHook/hook';
// import { setUserList } from "@/redux-toolkit/slice/userSlice";

// export function StoriesCarousel() {
//     const dispatch = useAppDispatch();
//     const users = useAppSelector((state)=> state?.user?.userList);
//     const user = JSON.parse(localStorage.getItem("user"));
//     const navigate = useNavigate();

//   const handleGetAllUser = async () => {
//     try {
//       const res = await getAllUser();
//       if (res.status === 200) {
//         dispatch(setUserList(res?.data?.data));
//       }
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   useEffect(() => {
//     if(users?.length === 0) {
//     handleGetAllUser(); 
//     }
//   }, [users?.length]);

//   return (
//     <div className="bg-card rounded-xl shadow-card p-4 mb-4">
//       <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
//         {/* Your story */}
//         <button className="flex flex-col items-center gap-1.5 shrink-0">
//           <div className="relative">
//             <img src={user?.profileImage} alt="Your story" className="h-16 w-16 rounded-full object-cover" />
//             {/* <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full gradient-primary flex items-center justify-center ring-2 ring-card">
//               <Plus className="h-3.5 w-3.5 text-primary-foreground" />
//             </div> */}
//           </div>
//           <span className="text-xs font-medium text-foreground">You</span>
//         </button>

//         {/* Other stories */}
//         {users.filter(s => s._id !== user?._id).map(story => (
//           <button key={story._id} className="flex flex-col items-center gap-1.5 shrink-0 group">
//             <div className={`p-[2.5px] rounded-full ${story.viewed ? 'bg-muted' : 'gradient-story'}`} onClick={()=>{navigate(`/profile/${story?._id}`)}}>
//               <img
//                 src={story?.profileImage}
//                 alt={story.fullName}
//                 className="h-16 w-16 rounded-full object-cover ring-2 ring-card group-hover:scale-105 transition-transform"
//               />
//             </div>
//             <span className="text-xs text-muted-foreground max-w-[4.5rem] truncate">{story.fullName}</span>
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// }









import { getAllUser } from "@/service/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux-toolkit/customHook/hook";
import { setUserList } from "@/redux-toolkit/slice/userSlice";
import { X } from "lucide-react";

export function StoriesCarousel() {
  const dispatch = useAppDispatch();
  const users = useAppSelector((state) => state?.user?.userList);
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const [openView, setOpenView] = useState(false);

  const handleGetAllUser = async () => {
    try {
      const res = await getAllUser();
      if (res.status === 200) {
        dispatch(setUserList(res?.data?.data));
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (users?.length === 0) {
      handleGetAllUser();
    }
  }, [users?.length]);

  return (
    <>
      {/* STORIES CARD */}
      <div className="bg-card rounded-xl shadow-card p-4 mb-4">

        {/* HEADER ROW (VIEW BUTTON MOVED HERE) */}
        <div className="flex items-center justify-between mb-3">

          <span className="text-sm font-semibold text-foreground">
            Stories
          </span>

          {/* VIEW BUTTON (TOP RIGHT) */}
          <button
            onClick={() => setOpenView(true)}
            className="px-3 py-1 text-xs rounded-full bg-primary text-white hover:opacity-90 transition"
          >
            View All
          </button>
        </div>

        {/* STORIES ROW */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">

          {/* YOUR STORY */}
          <button className="flex flex-col items-center gap-1.5 shrink-0">
            <img
              src={user?.profileImage}
              alt="You"
              className="h-16 w-16 rounded-full object-cover"
            />
            <span className="text-xs font-medium text-foreground">You</span>
          </button>

          {/* OTHER USERS */}
          {users
            ?.filter((s) => s._id !== user?._id)
            ?.map((story) => (
              <button
                key={story._id}
                className="flex flex-col items-center gap-1.5 shrink-0"
              >
                <div
                  className={`p-[2.5px] rounded-full ${story.viewed ? "bg-muted" : "gradient-story"
                    }`}
                  onClick={() => navigate(`/profile/${story?._id}`)}
                >
                  <img
                    src={story?.profileImage}
                    alt={story.fullName}
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-card hover:scale-105 transition-transform"
                  />
                </div>

                <span className="text-xs text-muted-foreground max-w-[4.5rem] truncate">
                  {story.fullName}
                </span>
              </button>
            ))}
        </div>
      </div>

      {/* MODAL OVERLAY */}
      {openView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">

          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpenView(false)}
          />

          {/* CARD */}
          <div className="relative z-10 w-[90%] max-w-md bg-card rounded-xl shadow-2xl p-4 max-h-[80vh] overflow-y-auto">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">All Users</h2>

              <button onClick={() => setOpenView(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* USER LIST */}
            <div className="space-y-3">

              {users
                ?.filter((s) => s._id !== user?._id)
                ?.map((story) => (
                  <div
                    key={story._id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => {
                      setOpenView(false);
                      navigate(`/profile/${story?._id}`);
                    }}
                  >
                    <img
                      src={story?.profileImage}
                      className="h-10 w-10 rounded-full object-cover"
                      alt=""
                    />

                    <div className="flex-1">
                      <p className="text-sm font-medium">{story.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        View profile
                      </p>
                    </div>
                  </div>
                ))}

            </div>
          </div>
        </div>
      )}
    </>
  );
}