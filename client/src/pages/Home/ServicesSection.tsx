import { motion } from "framer-motion";

interface Service {
  icon: string;
  title: string;
  description: string;
  tags: string[];
}

const SERVICES: Service[] = [
  {
    icon: "fas fa-laptop-code",
    title: "Full-Stack Web Apps",
    description:
      "End-to-end web applications — responsive front-ends, secure APIs, and databases — built with React, Laravel, Node.js and PHP.",
    tags: ["React", "Laravel", "Node.js"],
  },
  {
    icon: "fas fa-mobile-screen-button",
    title: "iOS / Mobile Apps",
    description:
      "Native iOS apps with SwiftUI — like PisoWise, a personal-finance app on the App Store powered by Apple Intelligence.",
    tags: ["SwiftUI", "iOS", "Apple Intelligence"],
  },
  {
    icon: "fas fa-robot",
    title: "AI Integration & Automation",
    description:
      "AI-powered features and hands-free workflows — natural-language interfaces, LLM integrations, and n8n / Zapier automations.",
    tags: ["OpenAI", "n8n", "Automation"],
  },
  {
    icon: "fas fa-graduation-cap",
    title: "LMS & E-Learning",
    description:
      "Learning Management Systems built and customised on Moodle — deployed for DepEd Region 4A, GSPTS, AIDEA and DTI.",
    tags: ["Moodle", "PHP", "MySQL"],
  },
  {
    icon: "fas fa-paint-brush",
    title: "UI/UX Design",
    description:
      "Clean, intuitive interfaces and design systems — from wireframes to polished, animated, accessible production UI.",
    tags: ["Figma", "Design Systems", "Motion"],
  },
  {
    icon: "fas fa-server",
    title: "Cloud, Servers & DevOps",
    description:
      "Deployment and server management across AWS, Vercel and more — CI/CD, Linux administration, and production maintenance.",
    tags: ["AWS", "Vercel", "Linux"],
  },
];

const ServicesSection = () => {
  return (
    <section id="services">
      <div className="wrap">
        <motion.div
          className="section-head"
          style={{ textAlign: "center" }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="eyebrow center">// services.ts</div>
          <h2 className="h2">
            What I <span className="grad">Build</span>
          </h2>
          <p className="sub" style={{ marginLeft: "auto", marginRight: "auto" }}>
            From pixel-perfect interfaces to the servers they run on — here's how I
            can help.
          </p>
        </motion.div>

        <div className="services-grid">
          {SERVICES.map((s, i) => (
            <motion.div
              className="service-card glass"
              key={s.title}
              initial={{ opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, delay: (i % 3) * 0.08 }}
            >
              <div className="svc-ic">
                <i className={s.icon} />
              </div>
              <h3>{s.title}</h3>
              <p>{s.description}</p>
              <div className="svc-tags">
                {s.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
