import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const testimonials = [
  {
    name: "Sneha Gupta",
    role: "Member since 2021",
    quote: "Joining ClubConnect was a turning point in my career. The mentorship and connections I've built here have been invaluable for my personal and professional growth.",
  },
  {
    name: "Karan Mehta",
    role: "Member since 2023",
    quote: "The community service projects gave me a deep sense of purpose. I've made lifelong friends and truly feel like I'm making a difference every day.",
  },
  {
    name: "Anita Desai",
    role: "Vice President",
    quote: "ClubConnect empowered me to lead. From organizing events to mentoring new members, every experience has shaped me into a more confident leader.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold mb-2">What Our Members Say</h2>
          <p className="text-muted-foreground">Real stories from real members</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="bg-card rounded-xl p-6 shadow-card border border-border relative"
            >
              <Quote className="h-8 w-8 text-secondary/30 absolute top-4 right-4" />
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 italic">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-display font-bold text-sm">
                    {t.name.split(" ").map(n => n[0]).join("")}
                  </span>
                </div>
                <div>
                  <div className="font-display font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
