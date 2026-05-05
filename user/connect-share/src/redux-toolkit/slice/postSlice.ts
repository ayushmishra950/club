import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  postList: []
};


const postSlice = createSlice({
  name: "Posts",
  initialState,
  reducers: {
    setPostList: (state, action) => {
      state.postList = action.payload;
    },

    setPostLikeAnUnLike: (state, action) => {
      const { postId, userId } = action.payload;
      const item = state?.postList?.find((p) => p?._id === postId);
      if (item) {
        item.likes = item?.likes?.filter((l) => l !== userId);
      }
      else {
        item.likes.push(userId);
      }
    },

    setPostComment: (state, action) => {
      const { postId, text, userId, fullName } = action.payload;
      const post = state.postList.find(p => p._id === postId);
      if (!post) return;

      const newComment = {
        _id: Date.now().toString(),
        text,
        createdAt: new Date().toISOString(),
        user: {
          user: userId,
          fullName: fullName
        },
      };

      if (!post.comments) post.comments = [];
      post.comments.push(newComment);
    },

    setPostLikeAnUnLikeComment: (state, action) => {
      const { postId, commentId, userId } = action.payload;
      const post = state.postList.find(p => p._id === postId);
      if (!post) return;
      const comment = post.comments.find(c => c._id === commentId);
      if (!comment) return;
      if (comment.likes.includes(userId)) {
        comment.likes = comment.likes.filter(l => l !== userId);
      } else {
        comment.likes.push(userId);
      }

    },

    setPostReplyComment: (state, action) => {
      const { postId, commentId, text, userId, fullName } = action.payload;
      const post = state.postList.find(p => p._id === postId);
      if (!post) return;
      const comment = post.comments.find(c => c._id === commentId);
      if (!comment) return;
      const newReply = {
        _id: Date.now().toString(),
        text,
        createdAt: new Date().toISOString(),
        user: {
          user: userId,
          fullName: fullName
        },
      };
      if (!comment.replies) comment.replies = [];
      comment.replies.push(newReply);
    },


    setDeletePostFromList: (state, action: PayloadAction<{ postId: string; userId: string }>) => {
      const { postId, userId } = action.payload;

      const postIndex = state.postList.findIndex(
        (p) => p._id === postId && p.createdBy?._id === userId
      );

      if (postIndex !== -1) {
        state.postList.splice(postIndex, 1);
      }
    }

  }

});

export const { setPostList, setPostLikeAnUnLike, setPostComment, setDeletePostFromList, setPostLikeAnUnLikeComment, setPostReplyComment } = postSlice.actions;

export default postSlice.reducer;

