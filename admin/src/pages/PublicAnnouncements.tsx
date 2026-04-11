import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { announcements } from "@/lib/dummy-data";

export default function PublicAnnouncements() {
  return (
    <div>
      <section className="py-20 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-display font-bold text-primary-foreground mb-4">Announcements</h1>
          <p className="text-primary-foreground/70">Latest news and updates from ClubConnect</p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-4">
            {announcements.map((ann, i) => (
              <motion.div key={ann.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="shadow-card hover:shadow-elevated transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-display font-semibold text-lg">{ann.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ml-3 ${
                        ann.priority === "high" ? "bg-destructive/10 text-destructive" :
                        ann.priority === "medium" ? "bg-warning/10 text-warning" :
                        "bg-muted text-muted-foreground"
                      }`}>{ann.priority}</span>
                    </div>
                    <p className="text-muted-foreground mb-4">{ann.content}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>By {ann.author}</span>
                      <span>{ann.date}</span>
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
