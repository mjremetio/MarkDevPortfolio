import { AI_TOOLS, AiIcon } from "@/components/AiToolIcons";

const TECHS = [
  { name: "HTML5", icon: "fab fa-html5", color: "#e34f26" },
  { name: "CSS3", icon: "fab fa-css3-alt", color: "#1572b6" },
  { name: "JavaScript", icon: "fab fa-js", color: "#f7df1e" },
  { name: "React", icon: "fab fa-react", color: "#61dafb" },
  { name: "Vue.js", icon: "fab fa-vuejs", color: "#42b883" },
  { name: "Angular", icon: "fab fa-angular", color: "#dd0031" },
  { name: "Node.js", icon: "fab fa-node-js", color: "#3c873a" },
  { name: "PHP", icon: "fab fa-php", color: "#777bb4" },
  { name: "Laravel", icon: "fab fa-laravel", color: "#ff2d20" },
  { name: "WordPress", icon: "fab fa-wordpress", color: "#21759b" },
  { name: "AWS", icon: "fab fa-aws", color: "#ff9900" },
  { name: "Git", icon: "fab fa-git-alt", color: "#f05032" },
  { name: "Sass", icon: "fab fa-sass", color: "#cc6699" },
];

type Item =
  | { kind: "fa"; name: string; icon: string; color: string }
  | { kind: "ai"; name: string; label: string; color: string };

const ITEMS: Item[] = [
  ...TECHS.map((t) => ({ kind: "fa" as const, ...t })),
  ...AI_TOOLS.map((t) => ({ kind: "ai" as const, ...t })),
];

const TechMarquee = () => {
  // Rendered twice so the -50% keyframe loops seamlessly.
  const loop = [...ITEMS, ...ITEMS];
  return (
    <div className="marquee-wrap" aria-hidden="true">
      <div className="marquee">
        {loop.map((t, i) => (
          <span className="tech-item" key={i}>
            {t.kind === "fa" ? (
              <i className={t.icon} style={{ color: t.color }} />
            ) : (
              <span style={{ color: t.color, display: "inline-flex" }}>
                <AiIcon name={t.name} size={22} />
              </span>
            )}
            {t.kind === "fa" ? t.name : t.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TechMarquee;
