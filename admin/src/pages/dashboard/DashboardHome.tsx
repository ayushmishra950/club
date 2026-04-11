import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { monthlyStats, announcements } from "@/lib/dummy-data";

const statCards = [
  { title: "Total Members", value: "65", change: "+3 this month", icon: Users, color: "text-primary" },
  { title: "Events This Month", value: "6", change: "+2 vs last month", icon: Calendar, color: "text-secondary" },
  { title: "Revenue (Mar)", value: "₹95,000", change: "+32%", icon: DollarSign, color: "text-success" },
  { title: "Growth Rate", value: "12%", change: "Steady growth", icon: TrendingUp, color: "text-info" },
];

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="shadow-card">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-display font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base font-display">Monthly Activity</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 20% 90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="members" fill="hsl(207 78% 20%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="events" fill="hsl(44 89% 61%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base font-display">Revenue Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 20% 90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="hsl(207 78% 20%)" strokeWidth={2} dot={{ fill: "hsl(44 89% 61%)" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base font-display">Recent Announcements</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {announcements.slice(0, 3).map((ann) => (
              <div key={ann.id} className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <h4 className="font-medium text-sm">{ann.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{ann.content}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ml-3 ${
                  ann.priority === "high" ? "bg-destructive/10 text-destructive" :
                  ann.priority === "medium" ? "bg-warning/10 text-warning" :
                  "bg-muted text-muted-foreground"
                }`}>{ann.priority}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
