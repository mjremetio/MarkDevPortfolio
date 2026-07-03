import { motion } from "framer-motion";

interface Step {
  no: string;
  icon: string;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    no: "01",
    icon: "fas fa-compass",
    title: "Discover",
    description:
      "We scope the goals, users and constraints, then agree on a clear plan and timeline before a line of code is written.",
  },
  {
    no: "02",
    icon: "fas fa-pen-ruler",
    title: "Design",
    description:
      "Wireframes and UI that map the flow — intuitive, on-brand, and reviewed together before build.",
  },
  {
    no: "03",
    icon: "fas fa-code",
    title: "Build",
    description:
      "Clean, tested front-end and back-end code, shipped in reviewable increments so you see progress early and often.",
  },
  {
    no: "04",
    icon: "fas fa-rocket",
    title: "Launch & Support",
    description:
      "Deploy to production, monitor, and iterate — with ongoing maintenance and improvements after go-live.",
  },
];

const ProcessSection = () => {
  return (
    <section id="process">
      <div className="wrap">
        <motion.div
          className="section-head"
          style={{ textAlign: "center" }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="eyebrow center">// how-i-work.md</div>
          <h2 className="h2">
            My <span className="grad">Process</span>
          </h2>
          <p className="sub" style={{ marginLeft: "auto", marginRight: "auto" }}>
            A simple, transparent way of working — from first call to launch and
            beyond.
          </p>
        </motion.div>

        <div className="process-grid">
          {STEPS.map((s, i) => (
            <motion.div
              className="process-step glass"
              key={s.no}
              initial={{ opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <span className="pstep-no">{s.no}</span>
              <div className="pstep-ic">
                <i className={s.icon} />
              </div>
              <h3>{s.title}</h3>
              <p>{s.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
