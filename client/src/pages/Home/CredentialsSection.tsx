import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useContentLoading } from "@/contexts/ContentLoadingContext";

interface FlowStep {
  icon: string;
  title: string;
  description: string;
}
interface Certification {
  name: string;
  issuer: string;
  year?: string;
  credentialId?: string;
  skills?: string;
  category?: string;
  image?: string;
  verifyUrl?: string;
}
interface Achievement {
  icon: string;
  title: string;
  description: string;
  image?: string;
}
interface CredentialsContent {
  title: string;
  subtitle: string;
  description: string;
  aiWorkflow: FlowStep[];
  certifications: Certification[];
  achievements: Achievement[];
}

// Bundled default so the section is populated before/without a fetch.
export const DEFAULT_CREDENTIALS: CredentialsContent = {
  title: "AI Practice & Credentials",
  subtitle: "// ai-practice.md",
  description:
    "The AI workflow I use to ship real products — plus the milestones and credentials behind the work.",
  aiWorkflow: [
    {
      icon: "compass",
      title: "Context & Prompt Design",
      description:
        "I engineer the context first — clear specs, examples, and constraints — so the model works from the same mental model I do. Good prompting is half the build.",
    },
    {
      icon: "code",
      title: "AI Pair Programming",
      description:
        "I build alongside Claude, Cursor, and Copilot in tight generate–refactor–review loops, while architecture and taste stay firmly human-owned.",
    },
    {
      icon: "database",
      title: "RAG & Knowledge Grounding",
      description:
        "For domain-heavy work I ground models in real data — docs, databases, embeddings — so answers are specific and verifiable, not generic.",
    },
    {
      icon: "diagram-project",
      title: "Automation Pipelines",
      description:
        "I wire multi-step agents and workflows in n8n and code, turning repetitive research, content, and ops work into reliable background jobs.",
    },
    {
      icon: "shield-halved",
      title: "Evaluation & Guardrails",
      description:
        "Every AI feature ships with checks — output validation, fallbacks, and human review on the paths that matter — so reliability isn't left to luck.",
    },
    {
      icon: "rocket",
      title: "Ship, Measure, Iterate",
      description:
        "I deploy, watch real usage, and tighten prompts, data, and UX until the feature is genuinely useful — not just a demo.",
    },
  ],
  certifications: [
    {
      category: "AI & Machine Learning",
      name: "No-Code AI App Builder Certification",
      issuer: "Airtable",
      year: "2026",
      credentialId: "jyfqqb3hk2j8",
      skills: "Generative AI · Software Development",
    },
    {
      category: "AI & Machine Learning",
      name: "Generative AI Certified",
      issuer: "Google",
      skills: "Generative AI",
    },
    {
      category: "AI & Machine Learning",
      name: "AI Practitioner",
      issuer: "",
    },
    {
      category: "Education & E-Learning",
      name: "Moodle Educator Certified",
      issuer: "Nephila Web",
      skills: "Moodle",
    },
  ],
  achievements: [
    {
      icon: "trophy",
      title: "Champion — AI Summit Hackathon 2025",
      description:
        "Took first place at the AI Summit Hackathon 2025 held at Reed Elsevier Shared Services Philippines (LexisNexis).",
    },
    {
      icon: "award",
      title: "Best in Web Development — Capstone",
      description:
        "Awarded Best in the Web Development category for my college capstone project.",
    },
    {
      icon: "medal",
      title: "2nd Place — Java Programming Competition",
      description: "Runner-up in an inter-collegiate Java programming competition.",
    },
    {
      icon: "terminal",
      title: "Competitive programming & hackathons",
      description:
        "Competed in Algolympics at UP Diliman (2018), Shopee Code League (2020), and UHACK (2017 & 2019).",
    },
    {
      icon: "calendar-check",
      title: "Conferences & summits",
      description:
        "Stay current through industry events — Moodle Moot Philippines, MarTech Summit Manila, and AWS events.",
    },
    {
      icon: "mobile-screen-button",
      title: "Published on the Apple App Store",
      description:
        "Shipped PisoWise, a native SwiftUI app with on-device Apple Intelligence.",
    },
    {
      icon: "briefcase",
      title: "7+ years shipping full-stack products",
      description:
        "Production web and mobile software across LMS, fintech, and automation.",
    },
  ],
};

const iconClass = (icon: string) =>
  icon.includes("fa-") ? icon : `fas fa-${icon}`;

const rise = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.06 },
  }),
};

const CredentialsSection = () => {
  const [content, setContent] = useState<CredentialsContent>(DEFAULT_CREDENTIALS);
  const { beginLoading, endLoading } = useContentLoading();

  useEffect(() => {
    let alive = true;
    (async () => {
      beginLoading();
      try {
        const res = await fetch("/api/content/credentials");
        if (!res.ok) throw new Error("no credentials content");
        const data = await res.json();
        // Guard against an empty/partial payload clobbering the defaults.
        if (alive && data && Array.isArray(data.aiWorkflow) && data.aiWorkflow.length) {
          setContent({ ...DEFAULT_CREDENTIALS, ...data });
        }
      } catch {
        /* keep defaults */
      } finally {
        endLoading();
      }
    })();
    return () => {
      alive = false;
    };
  }, [beginLoading, endLoading]);

  const { aiWorkflow, certifications, achievements } = content;

  // Cursor-follow glare for an interactive hover feel.
  const handleGlare = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--gx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--gy", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  // Group certifications by category, preserving first-seen order.
  const certGroups: { category: string; items: Certification[] }[] = [];
  certifications.forEach((c) => {
    const cat = c.category || "Certifications";
    let g = certGroups.find((x) => x.category === cat);
    if (!g) {
      g = { category: cat, items: [] };
      certGroups.push(g);
    }
    g.items.push(c);
  });

  return (
    <section id="credentials">
      <div className="wrap">
        <motion.div
          className="section-head"
          style={{ textAlign: "center" }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="eyebrow center">{content.subtitle || "// ai-practice.md"}</div>
          <h2 className="h2">
            How I Work with <span className="grad">AI</span>
          </h2>
          <p className="sub" style={{ marginLeft: "auto", marginRight: "auto" }}>
            {content.description}
          </p>
        </motion.div>

        {/* AI workflow */}
        <div className="cred-flow">
          {aiWorkflow.map((step, i) => (
            <motion.div
              className="flow-card glass"
              key={i}
              custom={i}
              variants={rise}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="flow-top">
                <span className="flow-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="flow-icon">
                  <i className={iconClass(step.icon)} />
                </span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <>
            <div className="cred-subhead">
              <span className="eyebrow">// achievements</span>
              <h3>Milestones &amp; Achievements</h3>
            </div>
            <div className="ach-grid">
              {achievements.map((a, i) => (
                <motion.div
                  className="ach-card glass"
                  key={i}
                  custom={i}
                  variants={rise}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  onMouseMove={handleGlare}
                >
                  <span className={`ach-icon${a.image ? " has-img" : ""}`}>
                    {a.image ? (
                      <img src={a.image} alt="" loading="lazy" />
                    ) : (
                      <i className={iconClass(a.icon)} />
                    )}
                  </span>
                  <div>
                    <h4>{a.title}</h4>
                    <p>{a.description}</p>
                  </div>
                  <span className="card-glare" />
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <>
            <div className="cred-subhead">
              <span className="eyebrow">// certifications</span>
              <h3>Certifications &amp; Credentials</h3>
            </div>
            {certGroups.map((group) => (
              <div className="cert-group" key={group.category}>
                <div className="cert-cat">{group.category}</div>
                <div className="cert-grid">
                  {group.items.map((c, i) => (
                    <motion.div
                      className="cert-card glass"
                      key={i}
                      custom={i}
                      variants={rise}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.2 }}
                      onMouseMove={handleGlare}
                    >
                      <span className={`cert-badge${c.image ? " has-img" : ""}`}>
                        {c.image ? (
                          <img src={c.image} alt="" loading="lazy" />
                        ) : (
                          <i className="fas fa-certificate" />
                        )}
                      </span>
                      <div className="cert-body">
                        <h4>{c.name}</h4>
                        {[c.issuer, c.year].filter(Boolean).length > 0 && (
                          <p className="cert-issuer">
                            {[c.issuer, c.year].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        {c.skills && <div className="cert-skills">{c.skills}</div>}
                        {c.credentialId && (
                          <div className="cert-cred">ID · {c.credentialId}</div>
                        )}
                        {c.verifyUrl && (
                          <a
                            className="cert-verify"
                            href={c.verifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Verify credential
                            <i className="fas fa-arrow-up-right-from-square" />
                          </a>
                        )}
                      </div>
                      <span className="card-glare" />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  );
};

export default CredentialsSection;
