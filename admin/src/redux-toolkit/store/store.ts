import { configureStore } from "@reduxjs/toolkit";
import eventReducer from "../slice/eventSlice";
import userReducer from "../slice/userSlice";
import donationReducer from "../slice/donationSlice";
import galleryReducer from "../slice/gallerySlice";
import categoryReducer from "../slice/categorySlice";
import postReducer from "../slice/postSlice";
import announcementReducer from "../slice/announcementSlice";


export const store = configureStore({
    reducer:{
        event:eventReducer,
        user:userReducer,
        donation:donationReducer,
        gallery:galleryReducer,
        category:categoryReducer,
        post:postReducer,
        announcement: announcementReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

