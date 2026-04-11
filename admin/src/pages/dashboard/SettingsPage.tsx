import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function SettingsPage() {
  const handleSave = () => toast.success("Settings saved");

  return (
    <div className="space-y-6 max-w-3xl">
      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base font-display">Profile Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1.5 block">Full Name</label><Input defaultValue="Rajesh Sharma" /></div>
            <div><label className="text-sm font-medium mb-1.5 block">Email</label><Input defaultValue="rajesh@club.org" /></div>
            <div><label className="text-sm font-medium mb-1.5 block">Phone</label><Input defaultValue="+91 98765 43210" /></div>
            <div><label className="text-sm font-medium mb-1.5 block">Role</label><Input defaultValue="President" disabled /></div>
          </div>
          <Button onClick={handleSave} className="gradient-gold text-secondary-foreground font-semibold">Save Profile</Button>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base font-display">Club Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1.5 block">Club Name</label><Input defaultValue="ClubConnect" /></div>
            <div><label className="text-sm font-medium mb-1.5 block">Founded Year</label><Input defaultValue="2020" /></div>
          </div>
          <Button onClick={handleSave} className="gradient-gold text-secondary-foreground font-semibold">Save Settings</Button>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base font-display">Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {["Email Notifications", "Push Notifications", "Event Reminders", "Payment Alerts"].map((label) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm">{label}</span>
              <Switch defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base font-display">Roles & Permissions</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { role: "President", perms: "Full access to all modules" },
              { role: "Secretary", perms: "Manage members, events, announcements" },
              { role: "Treasurer", perms: "Finance, payments management" },
              { role: "Member", perms: "View access, RSVP, polls" },
            ].map((r) => (
              <div key={r.role} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="font-medium text-sm">{r.role}</span>
                <span className="text-xs text-muted-foreground">{r.perms}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
