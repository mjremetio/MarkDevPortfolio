import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { getProjectsContent } from "@/utils/contentLoader";
import { useContentLoading } from "@/contexts/ContentLoadingContext";
import { getRenderableImageSource } from "@/utils/imagePath";

interface ProjectItem {
  title: string;
  description: string;
  imagePlaceholder: string;
  technologies: string[];
  githubLink?: string;
  liveLink?: string;
}

const FILTERS = [
  { key: "all", label: "All" },
  { key: "lms", label: "LMS" },
  { key: "ai", label: "AI & Automation" },
  { key: "systems", label: "Systems" },
  { key: "web", label: "Web & Dashboards" },
];

/** Infer a filter category from a project's text/tech, since content has none. */
function categorize(p: ProjectItem): string {
  const s = `${p.title} ${p.description} ${p.technologies.join(" ")}`.toLowerCase();
  if (/automation|zapier|workflow|\bai\b|\bml\b/.test(s)) return "ai";
  if (/moodle|learning|\blms\b|course|education|elms/.test(s)) return "lms";
  if (/inventory|ordering|clearance|management system|\bpos\b|\berp\b/.test(s)) return "systems";
  return "web";
}

function initials(title: string) {
  return title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const ProjectCard = ({ project, index }: { project: ProjectItem; index: number }) => {
  const imageSrc = getRenderableImageSource(project.imagePlaceholder);

  const handleGlare = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--gx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--gy", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <motion.article
      className="pcard glass"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
    >
      <div className="pcover" onMouseMove={handleGlare}>
        {imageSrc ? (
          <img src={imageSrc} alt={project.title} loading="lazy" />
        ) : (
          <div className="codecover">{initials(project.title)}</div>
        )}
        <div className="glare" />
      </div>
      <div className="pbody">
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <div className="ptags">
          {project.technologies.slice(0, 6).map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
        <div className="plinks">
          {project.liveLink && project.liveLink !== "#" ? (
            <a href={project.liveLink} target="_blank" rel="noopener noreferrer">
              <i className="fas fa-arrow-up-right-from-square" />
              Live
            </a>
          ) : (
            <span className="dim" style={{ fontSize: 13, color: "var(--muted)" }}>
              <i className="fas fa-clock" /> In progress
            </span>
          )}
          {project.githubLink && (
            <a className="dim" href={project.githubLink} target="_blank" rel="noopener noreferrer">
              <i className="fab fa-github" />
              Code
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
};

const ProjectsSection = () => {
  const [content, setContent] = useState(getProjectsContent());
  const [filter, setFilter] = useState("all");
  const { beginLoading, endLoading } = useContentLoading();

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      beginLoading();
      try {
        const res = await fetch("/api/content/projects");
        if (!res.ok) throw new Error("Failed to fetch projects content");
        const data = await res.json();
        if (isMounted) setContent(data);
      } catch (error) {
        console.log("Using default projects content:", error);
      } finally {
        endLoading();
      }
    };
    void load();
    return () => {
      isMounted = false;
    };
  }, [beginLoading, endLoading]);

  const projects = (content.projects || []) as ProjectItem[];
  const withCat = useMemo(
    () => projects.map((p) => ({ p, cat: categorize(p) })),
    [projects]
  );
  const visible = withCat.filter(({ cat }) => filter === "all" || cat === filter);

  return (
    <section id="projects">
      <div className="wrap">
        <motion.div
          className="section-head"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="eyebrow">&lt;section id="projects" /&gt;</div>
          <h2 className="h2">
            Featured <span className="grad">Projects</span>
          </h2>
          <p className="sub">{content.description}</p>
        </motion.div>

        <div className="filters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`fbtn ${filter === f.key ? "active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="proj-grid">
          {visible.map(({ p }, i) => (
            <ProjectCard key={`${p.title}-${i}`} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
