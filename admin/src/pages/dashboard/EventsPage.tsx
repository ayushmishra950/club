import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Calendar, MapPin, Users, Clock, Edit, Delete, Trash } from "lucide-react";
import { events as initialEvents } from "@/lib/dummy-data";
import EventDialog from "@/components/forms/EventDialog";
import { getEvent, deleteEvent } from "@/service/event";
import DeleteCard from "@/components/cards/DeleteCard";
import { useToast } from "@/hooks/use-toast";
import socket from "@/socket/socket";
import { useAppDispatch, useAppSelector } from "@/redux-toolkit/customHook/hook";
import { setEventList, setInterestedAndNotCandidate } from "@/redux-toolkit/slice/eventSlice";



export default function EventsPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState(initialEvents);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [initialData, setIntialData] = useState(null);
  const [eventListRefresh, setEventListRefresh] = useState(false);
  const [deleteEvents, setDeleteEvents] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const dispatch = useAppDispatch();
  const eventList = useAppSelector((state)=> state?.event?.eventList);

  
 useEffect(() => {
  socket.on("interestedcandidateFromEvent", (data) => {
     dispatch(setInterestedAndNotCandidate(data));
    // setEventList((prevList) =>
    //   prevList.map((event) => {
    //     if (event._id === eventId) {
    //       const alreadyExists = event.interestedCandidate.includes(userId);

    //       return {
    //         ...event, interestedCandidate: alreadyExists ? event.interestedCandidate.filter((id) => id !== userId) : [...event.interestedCandidate, userId],
    //       };
    //     }
    //     return event;
    //   })
    // );
  });
  return () => {
    socket.off("interestedcandidateFromEvent");
  };
}, []);



  const handleDeleteEvent = async () => {
    try {
      setDeleteLoading(true);
      const res = await deleteEvent(deleteEvents?._id);

      if (res?.status === 200) {
        toast({ title: "User Deleted Successfully.", description: res?.data?.message });
        setEventListRefresh(true);
        setDeleteDialogOpen(false);
        setDeleteEvents(null);
      }
    }
    catch (err) {
      console.log(err);
      toast({ title: "User Deleted Failed.", description: err?.response?.data?.message || err?.message, variant: "destructive" })
    } finally {
      setDeleteLoading(false);
    }

  }

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

  return (
    <>
      <DeleteCard
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        isLoading={deleteLoading}
        buttonName="Delete"
        title={`Delete Event: ${deleteEvents?.title}`} // Dynamic title
        description={`Are you sure you want to delete the event "${deleteEvents?.title}"? This action cannot be undone.`} // Dynamic description
        onConfirm={handleDeleteEvent}
      />
      <EventDialog isOpen={eventDialogOpen} onOpenChange={setEventDialogOpen} initialData={initialData} setEventListRefresh={setEventListRefresh} />
      <div className="space-y-4 ">
        <div className="flex justify-between items-center">
          <h3 className="font-display font-semibold text-lg">All Events</h3>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-gold text-secondary-foreground font-semibold" onClick={() => { setIntialData(null); setEventDialogOpen(true) }}><Plus className="h-4 w-4 mr-1" /> Create Event</Button>
            </DialogTrigger>
          </Dialog>
        </div>

        {eventList?.length > 0 ? <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {
  eventList?.map((event) => (
    <Card
      key={event?._id}
      className="shadow-card hover:shadow-elevated transition-shadow relative overflow-hidden"
    >
      {/* 🔥 Cover Image */}
      {event?.coverImage && (
        <div className="w-full h-40 overflow-hidden">
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* 🔥 Top Right Icons */}
      <div className="absolute top-3 right-3 flex gap-2 z-10">
        <button
          onClick={() => {
            setIntialData(event);
            setEventDialogOpen(true);
          }}
          className="p-1 rounded hover:bg-gray-100 bg-white/80 backdrop-blur"
        >
          <Edit className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        <button
          onClick={() => {
            setDeleteEvents(event);
            setDeleteDialogOpen(true);
          }}
          className="p-1 rounded hover:bg-red-100 bg-white/80 backdrop-blur"
        >
          <Trash className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
        </button>
      </div>

      <CardContent className="p-5">
        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary mb-3">
          {event.category}
        </span>

        <h3 className="font-display font-semibold text-lg mb-2">
          {event.title}
        </h3>

        <p className="text-sm text-muted-foreground mb-4">
          {event.description}
        </p>

        <div className="space-y-2 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-secondary" />
            {new Date(event.date)?.toLocaleDateString()}
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-secondary" />
            {new Date(event.date).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-secondary" />
            {event.location}
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-secondary" />
            {event?.interestedCandidate?.length} attending
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-secondary" />
            {event?.type}
          </div>
        </div>
      </CardContent>
    </Card>
  ))
}
        </div> :
          <p className="flex items-center justify-center h-[400px]">No Data Found.</p>
        }
      </div>
    </>
  );
}
