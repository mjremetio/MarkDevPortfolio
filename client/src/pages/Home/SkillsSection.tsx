import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { getSkillsContent } from "@/utils/contentLoader";
import { useContentLoading } from "@/contexts/ContentLoadingContext";

interface Skill {
  name: string;
  percentage: number;
}
interface Category {
  title: string;
  icon: string;
  skills: Skill[];
}

const PANEL_VARIANTS = ["sp-front", "sp-back", "sp-devops"];

const RING = [
  { icon: "fab fa-html5", name: "HTML5", color: "#e34f26" },
  { icon: "fab fa-css3-alt", name: "CSS3", color: "#1572b6" },
  { icon: "fab fa-js", name: "JS", color: "#f7df1e" },
  { icon: "fab fa-react", name: "React", color: "#61dafb" },
  { icon: "fab fa-vuejs", name: "Vue", color: "#42b883" },
  { icon: "fab fa-angular", name: "Angular", color: "#dd0031" },
  { icon: "fab fa-node-js", name: "Node", color: "#3c873a" },
  { icon: "fab fa-php", name: "PHP", color: "#777bb4" },
  { icon: "fab fa-laravel", name: "Laravel", color: "#ff2d20" },
  { icon: "fab fa-wordpress", name: "WP", color: "#21759b" },
  { icon: "fab fa-aws", name: "AWS", color: "#ff9900" },
  { icon: "fab fa-git-alt", name: "Git", color: "#f05032" },
  { icon: "fab fa-sass", name: "Sass", color: "#cc6699" },
];

const SkillBar = ({ name, percentage }: Skill) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  return (
    <div className="bar-row" ref={ref}>
      <div className="bar-top">
        <b>{name}</b>
        <span>{percentage}%</span>
      </div>
      <div className="bar">
        <i style={{ width: inView ? `${percentage}%` : 0 }} />
      </div>
    </div>
  );
};

const SkillsSection = () => {
  const [content, setContent] = useState(getSkillsContent());
  const { beginLoading, endLoading } = useContentLoading();

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      beginLoading();
      try {
        const res = await fetch("/api/content/skills");
        if (!res.ok) throw new Error("Failed to fetch skills content");
        const data = await res.json();
        if (isMounted) setContent(data);
      } catch (error) {
        console.log("Using default skills content:", error);
      } finally {
        endLoading();
      }
    };
    void load();
    return () => {
      isMounted = false;
    };
  }, [beginLoading, endLoading]);

  return (
    <section id="skills">
      <div className="wrap">
        <motion.div
          className="section-head"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="eyebrow">// skills.config.js</div>
          <h2 className="h2">
            Technical <span className="grad">Skills</span>
          </h2>
          <p className="sub">{content.subtitle}</p>
        </motion.div>

        <div className="skills-grid">
          {(content.categories as Category[])?.map((cat, i) => (
            <motion.div
              className={`skill-panel glass ${PANEL_VARIANTS[i % PANEL_VARIANTS.length]}`}
              key={cat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <div className="sp-head">
                <div className="fi">
                  <i className={cat.icon} />
                </div>
                <h3>{cat.title}</h3>
              </div>
              {cat.skills?.map((s) => (
                <SkillBar key={s.name} name={s.name} percentage={s.percentage} />
              ))}
            </motion.div>
          ))}
        </div>

        <div className="ring-stage">
          <div className="ring3d">
            {RING.map((t, i) => (
              <div
                className="node"
                key={t.name}
                style={{
                  transform: `rotateY(${i * (360 / RING.length)}deg) translateZ(250px)`,
                  color: t.color,
                }}
              >
                <i className={t.icon} />
                <span>{t.name}</span>
              </div>
            ))}
          </div>
          <div className="ring-caption">// hover to pause · {RING.length} technologies in orbit</div>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
