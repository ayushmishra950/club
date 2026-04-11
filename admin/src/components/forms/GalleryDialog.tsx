import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "../ui/select";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {addGallery,updateGallery } from "@/service/gallery";
import { getEvent } from "@/service/event";
import { useAppDispatch, useAppSelector } from "@/redux-toolkit/customHook/hook";
import { setEventList } from "@/redux-toolkit/slice/eventSlice";

const GalleryDialog = ({ isOpen, onOpenChange, initialData, setGalleryListRefresh }) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const {toast} = useToast();
    const [formData, setFormData] = useState({ event: "all", image: null });
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const isEdit = Boolean(initialData);
    const imageRef = useRef(null);
    const [eventListRefresh, setEventListRefresh] = useState<boolean>(false);
    const dispatch = useAppDispatch();
      const eventList = useAppSelector((state)=> state?.event?.eventList);

    useEffect(() => {
        if (initialData && isOpen) {
            setFormData({ event: initialData?.event, image: initialData?.image });
            setImagePreview(initialData?.image);
        }
    }, [isOpen, initialData]);

    const resetForm = () => { setImagePreview(null); setFormData({ event: "all", image: null }) };

    const handleChange = (e) => {
        const selectedFiles = e.target?.files?.[0];
        if (selectedFiles) {
            setFormData({ ...formData, image: selectedFiles });
            setImagePreview(URL.createObjectURL(selectedFiles));
        }
    }

    const handleSubmit = async(e) => {
        e.preventDefault();
        let obj = {...formData, id : initialData?._id || null}
        const convertFormData = new FormData();
       Object.keys(obj).forEach((k) => {
    const v = obj[k];
    if (v) convertFormData.append(k, v);
  });
        try{
          setIsLoading(true);
          const res = await (isEdit? updateGallery(convertFormData) : addGallery(convertFormData)) ;
          console.log(res)
          if(res.status===201 || res.status===200){
             toast({title:isEdit?"Update Gallery.":"Create Gallery.", description:res?.data?.message});
             setGalleryListRefresh(true);
             onOpenChange(false);
             resetForm();
          }

        }catch(err){
            console.log(err);
        }
        finally{
            setIsLoading(false);
        }

    }


    
      const handleGetEvent = async()=>{
        try{
           const res = await getEvent();
           console.log(res)
           if(res.status===200){
            dispatch(setEventList(res?.data?.event))
            setEventListRefresh(false);
           }
        }
        catch(err){
          console.log(err?.message);
          
        }
      };
    
      useEffect(()=>{
        if(eventListRefresh || eventList?.length===0){
     handleGetEvent();
        }
       
      },[eventListRefresh, eventList?.length])


    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => { resetForm(); onOpenChange(open) }} >
                <DialogContent>
                    <DialogHeader className="text-left" >
                        <DialogTitle>Event Gallery</DialogTitle>
                        <DialogDescription>Event Gallery</DialogDescription>
                    </DialogHeader>
                    <form className="text-left" onSubmit={handleSubmit} >
                        <div className="my-1">
                            <Label>Select Event</Label>
                            <Select value={formData?.event} onValueChange={(value) => { setFormData({ ...formData, event: value }) }} >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                   {eventList?.map((v)=> <SelectItem value={v?._id} >{v?.title}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="my-1">
                            <Label>Image</Label>
                            <Input type="file" onChange={handleChange} ref={imageRef} />
                            {imagePreview && <div className="relative bg-black w-20 h-20 mt-3 rounded">
                                <img src={imagePreview} className="object-cover w-full h-full" />
                                <div className="absolute right-0 top-0 bg-red-500 rounded-full cursor-pointer" onClick={() => { setImagePreview(null); setFormData({ ...formData, image: null }); if (imageRef.current?.value) { imageRef.current.value = null } }} >
                                    <X />
                                </div>
                            </div>}
                        </div>

                        <div className="flex justify-end mt-2">
                            <Button disabled={isLoading || !formData?.event || !formData?.image}>
                                {isLoading && <Loader2 className="animate-spin w-2 h-2 " />}
                                {isEdit? isLoading ? "Updating...": "Update" : isLoading ? "Creating..." : "Create"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
};


export default GalleryDialog;