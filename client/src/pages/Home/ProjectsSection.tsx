import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getProjectsContent } from "@/utils/contentLoader";

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
  // Check if imagePlaceholder is a URL (starts with /uploads or http)
  const isImageUrl = imagePlaceholder && (imagePlaceholder.startsWith('/uploads') || imagePlaceholder.startsWith('http'));

  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl group project-card"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        .project-card:hover .project-overlay {
          opacity: 1;
        }
      `}} />
      
      <div className="relative h-56 overflow-hidden">
        {isImageUrl ? (
          // Display the actual image if a URL is provided
          <div className="w-full h-full relative">
            <img 
              src={imagePlaceholder} 
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => console.error("Error loading image:", title)} 
            />
          </div>
        ) : (
          // Display placeholder if no image URL
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">{imagePlaceholder}</span>
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
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {description}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {technologies.map((tech, i) => (
            <span key={i} className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded-full text-xs">{tech}</span>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <a href="#" className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium text-sm flex items-center">
            <span>View Project</span>
            <i className="fas fa-arrow-right ml-1"></i>
          </a>
          <div className="flex space-x-2">
            {githubLink && (
              <a href={githubLink} target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                <i className="fab fa-github"></i>
              </a>
            )}
            {liveLink && (
              <a href={liveLink} target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
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

  useEffect(() => {
    // Set default content
    const defaultContent = getProjectsContent();
    setContent(defaultContent);
    
    // Attempt to fetch updated content from API
    fetch('/api/content/projects')
      .then(response => {
        if (response.ok) return response.json();
        throw new Error('Failed to fetch projects content');
      })
      .then(data => {
        setContent(data);
      })
      .catch(error => {
        console.log('Using default projects content:', error);
        // On error, use the local content (already set as default)
      });
  }, []);

  return (
    <section id="projects" className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-sans text-gray-900 dark:text-white">{content.title}</h2>
          <div className="mt-3 w-16 h-1 bg-gradient-to-r from-primary-600 to-secondary-500 mx-auto rounded-full"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
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
          <Button className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-300 shadow-md hover:shadow-lg">
            <span>View All Projects</span>
            <i className="fas fa-arrow-right ml-2"></i>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;