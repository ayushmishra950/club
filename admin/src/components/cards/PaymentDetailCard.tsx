import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { acceptPaymentRequest } from "@/service/auth";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch } from "@/redux-toolkit/customHook/hook";
import { setUpdateUser } from "@/redux-toolkit/slice/userSlice";


export default function PaymentDetailCard({ paymentDialog, setPaymentDialog, selectedPayment }) {
    const { toast } = useToast();
    const dispatch = useAppDispatch();


    const handleAcceptPayment = async () => {
        if(!selectedPayment?._id) return;
        try {
            const res = await acceptPaymentRequest(selectedPayment?._id);
            console.log(res);
            if (res.status === 200) {
                toast({ title: "Payment Accepted.", description: res?.data?.message });
                dispatch(setUpdateUser(res?.data?.user));
                setPaymentDialog(false);
            }
        }
        catch (err) {
            toast({ title: "Accept payment failed.", description: err?.response?.data?.message || err?.message, variant: "destructive" })
        }};

    return (
        <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
            <DialogContent className="max-w-md">

                <DialogHeader>
                    <DialogTitle>Payment Verification</DialogTitle>
                </DialogHeader>

                {/* Image Preview */}
                {selectedPayment?.paymentImage && (
                    <div className="flex justify-center">
                        <img
                            src={selectedPayment.paymentImage}
                            alt="payment"
                            className="w-40 h-40 object-cover rounded-md border"
                        />
                    </div>
                )}

                <div className="mt-3">
                    <p className="text-sm text-muted-foreground">Transaction Number</p>
                    <p className="font-semibold">
                        {selectedPayment?.transitionNumber || "N/A"}
                    </p>
                </div>

                <Button
                    className="w-full mt-4"
                    onClick={
                        selectedPayment?.premiumUser === "premium"
                            ? undefined
                            : 
                            handleAcceptPayment
                    }
                    disabled={selectedPayment?.premiumUser === "premium"}
                >
                    {selectedPayment?.premiumUser === "premium"
                        ? "Payment Approved (Premium)"
                        : "Accept"}
                </Button>

            </DialogContent>
        </Dialog>
    );
};