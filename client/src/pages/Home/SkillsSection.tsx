import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { getSkillsContent } from "@/utils/contentLoader";

interface SkillItemProps {
  name: string;
  percentage: number;
  delay: number;
  colorClass: string;
}

interface SkillCategory {
  title: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  titleColor: string;
  skills: Array<{
    name: string;
    percentage: number;
    colorClass: string;
  }>;
}

interface Technology {
  name: string;
  icon: string;
}

const SkillItem = ({ name, percentage, delay, colorClass }: SkillItemProps) => {
  const progressRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && progressRef.current) {
          setTimeout(() => {
            if (progressRef.current) {
              progressRef.current.style.width = `${percentage}%`;
            }
          }, delay * 100);
        }
      });
    }, { threshold: 0.1 });
    
    if (progressRef.current) {
      observer.observe(progressRef.current);
    }
    
    return () => {
      if (progressRef.current) {
        observer.unobserve(progressRef.current);
      }
    };
  }, [percentage, delay]);

  return (
    <div className="cursor-pointer" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="flex justify-between mb-1">
        <motion.span 
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
          initial={{ x: 0 }}
          animate={{ x: isHovered ? 2 : 0 }}
          transition={{ type: "spring", stiffness: 300 }}
          style={{ fontWeight: isHovered ? 600 : 500 }}
        >
          {name}
        </motion.span>
        <motion.span 
          className="text-sm font-medium text-indigo-600 dark:text-indigo-400"
          initial={{ scale: 1 }}
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {percentage}%
        </motion.span>
      </div>
      <div 
        className={`progress-bar bg-gray-200 dark:bg-gray-700 ${isHovered ? 'h-3' : 'h-2'} rounded-lg overflow-hidden transition-all duration-300`}
      >
        <div 
          ref={progressRef}
          className={`progress-bar-fill bg-indigo-600 h-full w-0 transition-all duration-1000 ease-out`}
          style={{ boxShadow: isHovered ? "0 0 5px rgba(79, 70, 229, 0.5)" : "none" }}
        ></div>
      </div>
    </div>
  );
};

const TechIcon = ({ icon, name, delay }: { icon: string, name: string, delay: number }) => {
  return (
    <motion.div 
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: delay * 0.1 }}
      whileHover={{ y: -5 }}
    >
      <motion.div 
        className="w-16 h-16 flex items-center justify-center bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md"
        whileHover={{ 
          scale: 1.1, 
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" 
        }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <i className={`${icon} text-3xl`}></i>
      </motion.div>
      <motion.span 
        className="mt-2 text-sm text-gray-600 dark:text-gray-400"
        whileHover={{ fontWeight: 600 }}
      >
        {name}
      </motion.span>
    </motion.div>
  );
};

const SkillsSection = () => {
  const [content, setContent] = useState(getSkillsContent());
  
  useEffect(() => {
    // Attempt to fetch updated content from API
    fetch('/api/content/skills')
      .then(response => {
        if (response.ok) return response.json();
        throw new Error('Failed to fetch skills content');
      })
      .then(data => {
        setContent(data);
      })
      .catch(error => {
        console.log('Using default skills content:', error);
        // On error, use the local content (already set as default)
      });
  }, []);
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section id="skills" className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-sans text-gray-900 dark:text-white">{content.title}</h2>
          <div className="mt-3 w-16 h-1 bg-gradient-to-r from-primary-600 to-secondary-500 mx-auto rounded-full"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {content.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.categories?.map((category, categoryIndex) => (
            <motion.div 
              key={category.title}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className={`${category.iconBg} p-3 rounded-full mr-4`}>
                    <i className={`${category.icon} ${category.iconColor}`}></i>
                  </div>
                  <h3 className={`text-xl font-semibold ${category.titleColor}`}>{category.title}</h3>
                </div>
                
                <div className="space-y-4">
                  {category.skills?.map((skill, skillIndex) => (
                    <SkillItem 
                      key={skill.name}
                      name={skill.name}
                      percentage={skill.percentage}
                      delay={skillIndex + 1}
                      colorClass={skill.colorClass}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="mt-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
        >
          <h3 className="text-xl font-semibold text-center text-gray-800 dark:text-white mb-8">Technologies I Work With</h3>
          
          <div className="relative overflow-hidden py-6">
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes slideLeft {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .tech-slider {
                animation: slideLeft 30s linear infinite;
                width: max-content;
                display: flex;
                gap: 2.5rem;
              }
              .tech-slider:hover {
                animation-play-state: paused;
              }
            `}} />
            
            <div className="tech-slider pr-8">
              {/* First set of tech icons */}
              {content.technologies?.map((tech, index) => (
                <TechIcon 
                  key={`first-${tech.name}`}
                  icon={tech.icon}
                  name={tech.name}
                  delay={index}
                />
              ))}
              
              {/* Duplicate set for infinite effect */}
              {content.technologies?.map((tech, index) => (
                <TechIcon 
                  key={`second-${tech.name}`}
                  icon={tech.icon}
                  name={tech.name}
                  delay={index}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SkillsSection;
