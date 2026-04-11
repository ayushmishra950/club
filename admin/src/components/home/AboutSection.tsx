import { Target, Users, Star } from "lucide-react";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export function AboutSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <h2 className="text-3xl font-display font-bold mb-4">About Our Club</h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              ClubConnect is a premier community organization dedicated to fostering leadership, encouraging service, and building lasting relationships among professionals and community leaders.
            </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Through our diverse programs and initiatives, we bring together people from all walks of life to create meaningful impact in our communities.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Target, label: "Service" },
                { icon: Users, label: "Fellowship" },
                { icon: Star, label: "Leadership" },
              ].map((item) => (
                <div key={item.label} className="text-center p-4 rounded-xl bg-muted/50">
                  <item.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2} className="rounded-2xl overflow-hidden shadow-elevated">
            <img src={heroBg} alt="About our club" className="w-full h-80 object-cover" loading="lazy" width={800} height={320} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
