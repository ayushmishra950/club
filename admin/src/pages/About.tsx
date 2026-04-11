import { Card, CardContent } from "@/components/ui/card";
import { Target, Users, Heart, Award, Globe, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function About() {
  return (
    <div>
      <section className="py-20 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-display font-bold text-primary-foreground mb-4">
            About ClubConnect
          </motion.h1>
          <p className="text-primary-foreground/70 max-w-2xl mx-auto">
            A community-driven organization fostering leadership, service, and fellowship since 2020.
          </p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div>
              <h2 className="text-2xl font-display font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                To provide a platform for professionals and community leaders to come together, share ideas, and create meaningful impact through service projects, educational programs, and networking opportunities.
              </p>
              <h2 className="text-2xl font-display font-bold mb-4">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                To be the leading community organization that empowers individuals to become agents of positive change in their communities and beyond.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Target, title: "Service", desc: "Community projects that matter" },
                { icon: Users, title: "Fellowship", desc: "Building lasting connections" },
                { icon: Award, title: "Leadership", desc: "Developing future leaders" },
                { icon: Heart, title: "Integrity", desc: "Ethical and transparent" },
                { icon: Globe, title: "Diversity", desc: "Inclusive for everyone" },
                { icon: Lightbulb, title: "Innovation", desc: "Creative problem solving" },
              ].map((val, i) => (
                <motion.div key={val.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                  <Card className="shadow-card h-full">
                    <CardContent className="p-4 text-center">
                      <val.icon className="h-8 w-8 mx-auto mb-2 text-secondary" />
                      <h3 className="font-display font-semibold text-sm mb-1">{val.title}</h3>
                      <p className="text-xs text-muted-foreground">{val.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
