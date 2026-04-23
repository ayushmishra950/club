import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";

const MemberDetailCard = ({ member, detailDialogOpen, setDetailDialogOpen }: any) => {
  if (!member) return null;

  const badgeLabel = member?.blocked
    ? "Blocked"
    : !member?.isVerified
      ? "Unverified"
      : "Active";

  const accountType = member?.accountType || member?.type || member?.role;
  const isBusiness = accountType?.toString().toLowerCase() === "business" || Boolean(member?.businessName);

  const businessVerifiedLabel = member?.businessVerified === true
    ? "Yes" : member?.businessVerified === false ? "No" : "Pending";

  return (
    <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
      <DialogContent className="max-w-4xl w-[95vw] sm:w-full max-h-[90vh] flex flex-col gap-4 p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Member Details</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="space-y-4 text-center">
            {member?.profileImage ? (
              <img
                src={member.profileImage}
                alt={member.fullName || "Member"}
                className="mx-auto h-40 w-40 rounded-full object-cover border"
              />
            ) : (
              <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full bg-muted text-3xl font-bold text-muted-foreground">
                {member?.fullName?.split(" ")?.map((n: string) => n[0])?.join("")}
              </div>
            )}
             <div className="flex justify-center">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Status</p>
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                {badgeLabel}
              </span>
            </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold">{member.fullName}</h3>
              <p className="text-sm text-muted-foreground">{member?.occupation || "Member"}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">User ID</p>
                <p className="font-medium">{member.userId || member._id}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
                <p className="font-medium">{member.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Phone</p>
                <p className="font-medium">{member.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">City / State</p>
                <p className="font-medium">{member.city || "N/A"}, {member.state || "N/A"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Address</p>
                <p className="font-medium">{member.address || "N/A"}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Gender</p>
                <p className="font-medium">{member.gender || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">DOB</p>
                <p className="font-medium">{member.dob ? new Date(member.dob).toLocaleDateString("en-IN") : "N/A"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Marital Status</p>
                <p className="font-medium">{member.maritalStatus || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Joined</p>
                <p className="font-medium">{member.createdAt ? new Date(member.createdAt).toLocaleString("en-IN") : "N/A"}</p>
              </div>
            </div>

            {isBusiness && (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="text-base font-semibold">Business Information</h4>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Business Name</p>
                    <p className="font-medium">{member.businessName || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Category</p>
                    <p className="font-medium">{member.businessCategory || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Business Phone</p>
                    <p className="font-medium">{member.businessPhone || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Business Address</p>
                    <p className="font-medium">{member.businessAddress || "N/A"}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Website</p>
                    <p className="font-medium break-all">{member.website || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Working Hours</p>
                    <p className="font-medium">{member.workingHours || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Business Verified</p>
                    <p className="font-medium">{businessVerifiedLabel}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Business Description</p>
                    <p className="font-medium">{member.businessDescription || "N/A"}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Father Name</p>
                <p className="font-medium">{member.fatherName || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Mother Name</p>
                <p className="font-medium">{member.motherName || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Spouse</p>
                <p className="font-medium">{member.spouseName || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Spouse Email</p>
                <p className="font-medium">{member.spouseEmail || "N/A"}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Premium Status</p>
                <p className="font-medium">{member.premiumUser === "premium" ? "Premium User" : "No Premium"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Last Seen</p>
                <p className="font-medium">{member.lastSeen ? new Date(member.lastSeen).toLocaleString("en-IN") : "N/A"}</p>
              </div>
            </div>

            <Button className="w-full" onClick={() => setDetailDialogOpen(false)}>
              Close
            </Button>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemberDetailCard;
