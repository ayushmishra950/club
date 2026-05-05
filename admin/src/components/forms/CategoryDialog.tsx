import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { addCategory, updateCategory } from "@/services/Service";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {validateForm} from "@/components/hook/category.form";

const CategoryDialog = ({ isOpen, onOpenChange, initialData, setCategoryListRefresh }) => {
    const [formData, setFormData] = useState<any>({});
    const {user} = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const [isSubmited, setIsSubmited] = useState(false);    
    const isEdit = Boolean(initialData);
   
    const resetForm = () => {setFormData({})};

    useEffect(() => {
        if (initialData && isOpen) {
            setFormData({
                name: initialData?.name,
                description: initialData?.description,
            })
        }
    }, [initialData, isOpen]);

     const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            const newFormData = { ...formData, [name]: value };
            setFormData(newFormData);
            if (isSubmited) {
                const errorData = validateForm(newFormData);
                setErrors(errorData);
            }
        }

    const handleSubmit = async () => {
          setIsSubmited(true);

          const errorData =  validateForm(formData);
          setErrors(errorData);
            if (Object.keys(errorData).length > 0) return;

        let obj = {...formData, adminId: user?._id, id:initialData?._id || null }
        try {
            setIsLoading(true);
            const res = await (initialData? updateCategory(obj) : addCategory(obj));
            if (res.status === 201 || res?.status===200) {
                toast({ title: initialData?"Update Category" :"Add Category", description: res.data.message })
                setCategoryListRefresh(true);
                onOpenChange(false);
                setFormData({})
            }
        }
        catch (err) {
            console.log(err)
            toast({ title: "Category Failed.", description: err?.response?.data?.message || err?.message, variant: "destructive" })
        }
        finally {
            setIsLoading(false);

        }
    }
    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open)=>{resetForm(); onOpenChange(open)}} >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEdit ? "Update Category Dialog." : "Add Category Dialog."}</DialogTitle>
                        <DialogDescription>Category Dialog</DialogDescription>
                    </DialogHeader>
                    <div>
                        <Label>Name</Label>
                        <Input name="name" type="text"  value={formData?.name} onChange={handleChange} className={errors?.name ? "border boder border-red-500" : "border border-input"} placeholder="Enter Name..." />
                         {errors?.name && <p className={`text-red-500 text-xs`}>name is required.</p>}
                    </div>
                    <div>
                        <Label>Description(Optional)</Label>
                        <Input name="description" type="text" value={formData?.description} onChange={handleChange} placeholder="Enter Description..." />
                    </div>
                  
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            onClick={() => {resetForm(); onOpenChange(false) }}
                            className="bg-gray-200 text-black hover:bg-gray-300"
                        >
                            Cancel
                        </Button>

                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="bg-blue-500 text-white hover:bg-blue-600"
                        >
                            {isLoading && <Loader2 className="animate-spin w-2 h-2" />}
                         {isEdit ? isLoading? "Updating..." : "Update" : isLoading ? "Creating..." : "Create"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
};


export default CategoryDialog;