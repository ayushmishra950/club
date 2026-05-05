import { motion } from "framer-motion";
import { Award, Crown } from "lucide-react";
import { members } from "@/lib/dummy-data";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export function LeadershipSection() {
  const leaders = members.filter(m => m.role !== "Member");

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold mb-2">Leadership & Recognition</h2>
          <p className="text-muted-foreground">Meet our dedicated leadership team and celebrated members</p>
        </div>

        {/* Leadership Team */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
          {leaders.map((member, i) => (
            <motion.div key={member.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center">
              <div className="w-20 h-20 rounded-full gradient-primary mx-auto mb-3 flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-xl">
                  {member.name.split(" ").map(n => n[0]).join("")}
                </span>
              </div>
              <h4 className="font-display font-semibold text-sm">{member.name}</h4>
              <p className="text-xs text-muted-foreground">{member.role}</p>
            </motion.div>
          ))}
        </div>

        {/* Member of the Month */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="max-w-2xl mx-auto">
          <div className="bg-card rounded-xl p-6 shadow-card border border-secondary/30 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 gradient-gold" />
            <Crown className="h-8 w-8 text-secondary mx-auto mb-3" />
            <h3 className="font-display font-bold text-lg mb-1">Member of the Month</h3>
            <div className="w-16 h-16 rounded-full gradient-gold mx-auto my-4 flex items-center justify-center">
              <span className="text-secondary-foreground font-display font-bold text-lg">SG</span>
            </div>
            <h4 className="font-display font-semibold">Sneha Gupta</h4>
            <p className="text-sm text-muted-foreground mt-1 mb-3">Outstanding contribution to the Education for All initiative</p>
            <div className="flex items-center justify-center gap-1 text-secondary">
              <Award className="h-4 w-4" />
              <span className="text-xs font-medium">March 2026</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
