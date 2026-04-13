import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { monthlyStats, announcements } from "@/lib/dummy-data";
import { getAllAnnouncement } from "@/service/announcement";
import { useAppDispatch, useAppSelector } from "@/redux-toolkit/customHook/hook";
import { setAnnouncementList } from "@/redux-toolkit/slice/announcementSlice";
import { useEffect, useState } from "react";
import { getAllUser } from "@/service/auth";
import {setUserList} from "@/redux-toolkit/slice/userSlice";
import { setEventList } from "@/redux-toolkit/slice/eventSlice";
import { getEvent } from "@/service/event";
import {getCurrentMonthCount} from "@/service/global";



export default function DashboardHome() {
    const [search, setSearch] = useState("");
   const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);
  const [totalPages, setTotalPages] = useState(0);
    const [memberListRefresh,setMemberListRefresh] = useState(false);
     const [eventListRefresh, setEventListRefresh] = useState(false);
      const [announcementListRefresh, setAnnouncementListRefresh] = useState(false);
   const dispatch = useAppDispatch();
    const announcementList = useAppSelector((state) => state?.announcement?.announcementList);
    const memberList = useAppSelector((state)=> state?.user?.userList);
    const eventList = useAppSelector((state)=> state?.event?.eventList);

    const currentMonthEvents = getCurrentMonthCount(eventList, "date");
    
const statCards = [
  { title: "Total Members", value: memberList?.filter((m)=> m?.isVerified === true)?.length, change: `${getCurrentMonthCount(memberList, "createdAt")} this month`, icon: Users, color: "text-primary" },
  { title: "Events This Month", value: eventList?.length, change: `${getCurrentMonthCount(memberList, "createdAt")} this month`, icon: Calendar, color: "text-secondary" },
  { title: "Revenue (Mar)", value: "₹95,000", change: "+32%", icon: DollarSign, color: "text-success" },
  { title: "Growth Rate", value: "12%", change: "Steady growth", icon: TrendingUp, color: "text-info" },
];

 const handleGetEvent = async () => {
    try {
      const res = await getEvent();
      console.log(res);
      if (res.status === 200) {
        dispatch(setEventList(res?.data?.event))
                setEventListRefresh(false);
      }
    }
    catch (err) {
      console.log(err);
    }
  };


  useEffect(() => {
    if (eventList?.length === 0 || eventListRefresh) {
      handleGetEvent();
    }
  }, [eventList?.length, eventListRefresh])

     const handleGetUsers = async () => {
        try {
          const res = await getAllUser({ page, perPage, search });
          if (res.status === 200) {
            dispatch(setUserList(res?.data?.users));
            setTotalPages(Math.ceil(res?.data?.total / perPage));
            setMemberListRefresh(false);
          }
        }
        catch (err) {
          console.log(err);
        }
      }
      useEffect(() => {
        if(memberList?.length === 0 || memberListRefresh)
       { handleGetUsers()}
      }, [memberList?.length, memberListRefresh]);

  const handleGetAllAnnouncements = async () => {
      try {
        const res = await getAllAnnouncement();
        if (res.status === 200) {
          dispatch(setAnnouncementList(res?.data?.announcements));
          setAnnouncementListRefresh(false);
        }
      }
      catch (err) {
        console.log(err);
      }
    };

    useEffect(() => {
        if (announcementList?.length === 0 || announcementListRefresh) {
          handleGetAllAnnouncements();
        }
      }, [announcementList?.length, announcementListRefresh])

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
            {announcementList.slice(0, 3).map((ann) => (
              <div key={ann.id} className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <h4 className="font-medium text-sm">{ann.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{ann.description}</p>
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
