import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Users } from "lucide-react";
import { motion } from "framer-motion";
import { events } from "@/lib/dummy-data";

export default function PublicEvents() {
  return (
    <div>
      <section className="py-20 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-display font-bold text-primary-foreground mb-4">Events</h1>
          <p className="text-primary-foreground/70">Discover our upcoming events and activities</p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {events.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="shadow-card hover:shadow-elevated transition-all h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">{event.category}</span>
                    </div>
                    <h3 className="font-display font-semibold text-lg mb-2">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-secondary" /> {event.date} at {event.time}</div>
                      <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-secondary" /> {event.location}</div>
                      <div className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-secondary" /> {event.attendees} attendees</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
