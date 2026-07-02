import { motion } from "framer-motion";

interface ExperienceItem {
  title: string;
  company: string;
  period: string;
  responsibilities: string[];
}

const experiences: ExperienceItem[] = [
  {
    title: "Web Designer and Developer",
    company: "Reed Elsevier Shared Philippines (LexisNexis Solutions)",
    period: "2024 — 2025",
    responsibilities: [
      "Website development & management using WordPress and TeamSite CRM",
      "Integrated Salesforce and various APIs for marketing automation",
      "Managed Google Ads campaigns and analyzed performance via Google Analytics",
      "Built automated marketing workflows using Zapier",
    ],
  },
  {
    title: "Full Stack Web Developer",
    company: "Razza Consulting Group, Inc.",
    period: "2022 — 2024",
    responsibilities: [
      "Planned and developed software and web applications",
      "Maintained company websites and digital products, including server infrastructure",
      "Developed front-end and back-end systems in Laravel, WordPress and Moodle",
      "Managed cloud infrastructure across multiple providers (AWS, GoDaddy, etc.)",
    ],
  },
  {
    title: "Web Developer Consultant",
    company: "Good Shepherd Professional Training Services",
    period: "2021 — 2022",
    responsibilities: [
      "Conducted quarterly stress tests for eLMS review programs",
      "Implemented and maintained technical requirements of web systems",
      "Managed server infrastructure, HTML markup, URL structure, and databases",
      "Assisted IT staff in maintaining the landing page and LMS platform",
    ],
  },
  {
    title: "Web Developer / Administrator",
    company: "Philippine Normal University",
    period: "2020 — 2022",
    responsibilities: [
      "Built and supported infrastructure for efficient content management",
      "Collaborated with PNU-LMS clients to ensure regular content updates",
      "Gathered stakeholder feedback to improve web services",
      "Documented core processes and maintained established standards",
    ],
  },
  {
    title: "MIS / IT Specialist",
    company: "STI College — San Jose Del Monte",
    period: "2019 — 2020",
    responsibilities: [
      "Maintained performance of computers in laboratories and offices",
      "Managed network infrastructure throughout the building",
      "Provided technical support and troubleshooting",
      "Created and implemented a Clearance Management System",
    ],
  },
];

const ExperienceSection = () => {
  return (
    <section id="experience">
      <div className="wrap">
        <motion.div
          className="section-head"
          style={{ textAlign: "center" }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="eyebrow center">// career-timeline.log</div>
          <h2 className="h2">
            Professional <span className="grad">Experience</span>
          </h2>
          <p className="sub" style={{ marginLeft: "auto", marginRight: "auto" }}>
            A timeline of my professional experience and career journey.
          </p>
        </motion.div>

        <div className="timeline">
          {experiences.map((exp, i) => (
            <motion.div
              className="titem"
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <div className="tdot" />
              <div className="tcard glass">
                <div className="trow">
                  <h3>{exp.title}</h3>
                  <span className="period">{exp.period}</span>
                </div>
                <div className="company">{exp.company}</div>
                <ul>
                  {exp.responsibilities.map((r, j) => (
                    <li key={j}>{r}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
