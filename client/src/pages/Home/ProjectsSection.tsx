import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getProjectsContent } from "@/utils/contentLoader";
import { useContentLoading } from "@/contexts/ContentLoadingContext";
import { getRenderableImageSource } from "@/utils/imagePath";

interface ProjectsContent {
  title: string;
  subtitle: string;
  description: string;
  projects: ProjectItem[];
}

interface ProjectItem {
  title: string;
  description: string;
  imagePlaceholder: string;
  technologies: string[];
  githubLink?: string;
  liveLink?: string;
}

interface ProjectCardProps {
  title: string;
  description: string;
  imagePlaceholder: string;
  technologies: string[];
  index: number;
  githubLink?: string;
  liveLink?: string;
}

const ProjectCard = ({
  title,
  description,
  imagePlaceholder,
  technologies,
  index,
  githubLink,
  liveLink
}: ProjectCardProps) => {
  const imageSrc = getRenderableImageSource(imagePlaceholder);
  const hasImage = Boolean(imageSrc);

  return (
    <motion.div
      className="card-enhanced bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700/50 group project-card"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="relative h-56 overflow-hidden">
        {hasImage && imageSrc ? (
          <div className="w-full h-full relative">
            <img
              src={imageSrc}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => console.error("Error loading image:", title)}
            />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">{imagePlaceholder}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6 project-overlay">
          <div>
            <h4 className="text-white font-semibold text-lg">View Details</h4>
            <p className="text-gray-300 text-sm">Click to see more</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 leading-relaxed">
          {description}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {technologies.map((tech, i) => (
            <span key={i} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">{tech}</span>
          ))}
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-slate-700/50">
          <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium text-sm flex items-center transition-colors">
            <span>View Project</span>
            <i className="fas fa-arrow-right ml-1"></i>
          </a>
          <div className="flex space-x-3">
            {githubLink && (
              <a href={githubLink} target="_blank" rel="noopener noreferrer" className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <i className="fab fa-github text-lg"></i>
              </a>
            )}
            {liveLink && (
              <a href={liveLink} target="_blank" rel="noopener noreferrer" className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <i className="fas fa-external-link-alt"></i>
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ProjectsSection = () => {
  const [content, setContent] = useState<ProjectsContent>({
    title: "Featured Projects",
    subtitle: "My Work",
    description: "Showcasing some of my best work across various technologies and platforms",
    projects: [
      {
        title: "E-Commerce CMS Platform",
        description: "Custom e-commerce solution with integrated CRM and payment processing for a retail client.",
        imagePlaceholder: "E-Commerce CMS",
        technologies: ["Laravel", "Vue.js", "MySQL", "AWS"],
        githubLink: "https://github.com/",
        liveLink: "#"
      },
      {
        title: "Learning Management System",
        description: "Enhanced Moodle-based LMS with custom plugins for university distance learning programs.",
        imagePlaceholder: "LMS Platform",
        technologies: ["PHP", "Moodle", "JavaScript", "MySQL"],
        githubLink: "https://github.com/",
        liveLink: "#"
      }
    ]
  });
  const { beginLoading, endLoading } = useContentLoading();

  useEffect(() => {
    // Set default content
    const defaultContent = getProjectsContent();
    setContent(defaultContent);

    // Attempt to fetch updated content from API
    let isMounted = true;
    const loadProjectsContent = async () => {
      beginLoading();
      try {
        const response = await fetch("/api/content/projects");
        if (!response.ok) {
          throw new Error("Failed to fetch projects content");
        }
        const data = await response.json();
        if (isMounted) {
          setContent(data);
        }
      } catch (error) {
        console.log("Using default projects content:", error);
      } finally {
        endLoading();
      }
    };

    void loadProjectsContent();

    return () => {
      isMounted = false;
    };
  }, [beginLoading, endLoading]);

  return (
    <section id="projects" className="py-16 md:py-24 section-alt transition-colors duration-500">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-sans text-gray-900 dark:text-white">{content.title}</h2>
          <div className="section-divider"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            {content.description}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.projects && content.projects.map((project, index) => (
            <ProjectCard
              key={index}
              title={project.title}
              description={project.description}
              imagePlaceholder={project.imagePlaceholder}
              technologies={project.technologies}
              index={index}
              githubLink={project.githubLink}
              liveLink={project.liveLink}
            />
          ))}
        </div>

        <div className="text-center mt-10">
          <Button className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all duration-300 shadow-md hover:shadow-lg">
            <span>View All Projects</span>
            <i className="fas fa-arrow-right ml-2"></i>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
