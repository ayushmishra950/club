import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { getEvent } from "@/service/event";
import { setEventList } from "@/redux-toolkit/slice/eventSlice";
import { useAppDispatch, useAppSelector } from '@/redux-toolkit/customHook/hook';
import { useEffect } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export function EventsPreviewSection() {
  const dispatch = useAppDispatch();
  const eventList = useAppSelector((state) => state?.event?.eventList);
    const filteredEvents = eventList?.filter(event => event?.type === "public");


  const handleGetEvent = async () => {
    try {
      const res = await getEvent();
      if (res.status === 200) {
        dispatch(setEventList(res?.data?.event));
      };
    }
    catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (eventList?.length === 0) {
      handleGetEvent();
    }
  }, [eventList?.length]);

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold mb-2">Upcoming Events</h2>
          <p className="text-muted-foreground">Don't miss out on our exciting upcoming events</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {filteredEvents?.slice(0, 3).map((event, i) => (
            <motion.div key={event?._id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <Card className="shadow-card hover:shadow-elevated transition-shadow h-full">
                <CardContent className="p-6">
                  <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary mb-3">
                    {event.category}
                  </span>
                  <h3 className="font-display font-semibold text-lg mb-2">{event.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(event.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>

                    <span> {new Date(event.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/events">
            <Button variant="outline">View All Events <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
