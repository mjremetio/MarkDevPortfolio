import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

interface SkillItemProps {
  name: string;
  percentage: number;
  delay: number;
  colorClass: string;
}

const SkillItem = ({ name, percentage, delay, colorClass }: SkillItemProps) => {
  const progressRef = useRef<HTMLDivElement>(null);
  
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
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{name}</span>
        <span className={`text-sm font-medium ${colorClass}`}>{percentage}%</span>
      </div>
      <div className="progress-bar bg-gray-200 dark:bg-gray-700 h-2 rounded-lg overflow-hidden">
        <div 
          ref={progressRef}
          className={`progress-bar-fill ${colorClass.replace('text', 'bg')} h-full w-0 transition-all duration-1000 ease-out`}
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
    >
      <div className="w-16 h-16 flex items-center justify-center bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md">
        <i className={`${icon} text-3xl`}></i>
      </div>
      <span className="mt-2 text-sm text-gray-600 dark:text-gray-400">{name}</span>
    </motion.div>
  );
};

const SkillsSection = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const skillCategories = [
    {
      title: "Frontend Development",
      icon: "fas fa-code",
      iconBg: "bg-primary-100 dark:bg-primary-900/30",
      iconColor: "text-primary-600 dark:text-primary-400",
      titleColor: "text-gray-800 dark:text-white",
      skills: [
        { name: "HTML5/CSS3", percentage: 95, colorClass: "text-primary-600 dark:text-primary-400" },
        { name: "JavaScript", percentage: 90, colorClass: "text-primary-600 dark:text-primary-400" },
        { name: "React/Vue/Angular", percentage: 85, colorClass: "text-primary-600 dark:text-primary-400" },
        { name: "CSS Preprocessors (SASS/LESS)", percentage: 90, colorClass: "text-primary-600 dark:text-primary-400" },
        { name: "UI/UX Design", percentage: 80, colorClass: "text-primary-600 dark:text-primary-400" }
      ]
    },
    {
      title: "Backend Development",
      icon: "fas fa-database",
      iconBg: "bg-secondary-100 dark:bg-secondary-900/30",
      iconColor: "text-secondary-600 dark:text-secondary-400",
      titleColor: "text-gray-800 dark:text-white",
      skills: [
        { name: "PHP (Laravel, WordPress)", percentage: 90, colorClass: "text-secondary-600 dark:text-secondary-400" },
        { name: "Node.js", percentage: 85, colorClass: "text-secondary-600 dark:text-secondary-400" },
        { name: "MySQL/PostgreSQL", percentage: 85, colorClass: "text-secondary-600 dark:text-secondary-400" },
        { name: "MongoDB", percentage: 80, colorClass: "text-secondary-600 dark:text-secondary-400" },
        { name: "API Development", percentage: 90, colorClass: "text-secondary-600 dark:text-secondary-400" }
      ]
    },
    {
      title: "DevOps & Tools",
      icon: "fas fa-cloud",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      titleColor: "text-gray-800 dark:text-white",
      skills: [
        { name: "AWS (EC2, EBS, SES)", percentage: 85, colorClass: "text-blue-600 dark:text-blue-400" },
        { name: "Git/GitHub/BitBucket", percentage: 90, colorClass: "text-blue-600 dark:text-blue-400" },
        { name: "Linux (SSH, Terminal)", percentage: 85, colorClass: "text-blue-600 dark:text-blue-400" },
        { name: "Project Management", percentage: 80, colorClass: "text-blue-600 dark:text-blue-400" },
        { name: "CRM Systems", percentage: 85, colorClass: "text-blue-600 dark:text-blue-400" }
      ]
    }
  ];

  const techIcons = [
    { icon: "fab fa-html5 text-orange-500", name: "HTML5", delay: 0 },
    { icon: "fab fa-css3-alt text-blue-500", name: "CSS3", delay: 1 },
    { icon: "fab fa-js text-yellow-400", name: "JavaScript", delay: 2 },
    { icon: "fab fa-react text-blue-400", name: "React", delay: 3 },
    { icon: "fab fa-vuejs text-green-500", name: "Vue.js", delay: 4 },
    { icon: "fab fa-angular text-red-600", name: "Angular", delay: 5 },
    { icon: "fab fa-node-js text-green-600", name: "Node.js", delay: 6 },
    { icon: "fab fa-php text-purple-600", name: "PHP", delay: 7 },
    { icon: "fab fa-laravel text-red-500", name: "Laravel", delay: 8 },
    { icon: "fab fa-wordpress text-blue-800", name: "WordPress", delay: 9 },
    { icon: "fab fa-aws text-orange-400", name: "AWS", delay: 10 },
    { icon: "fab fa-git-alt text-red-500", name: "Git", delay: 11 }
  ];

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
          <h2 className="text-3xl md:text-4xl font-bold font-sans text-gray-900 dark:text-white">Technical Skills</h2>
          <div className="mt-3 w-16 h-1 bg-gradient-to-r from-primary-600 to-secondary-500 mx-auto rounded-full"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A comprehensive set of skills accumulated over 5+ years of professional experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skillCategories.map((category, categoryIndex) => (
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
                  {category.skills.map((skill, skillIndex) => (
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
          
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {techIcons.map((tech) => (
              <TechIcon 
                key={tech.name}
                icon={tech.icon}
                name={tech.name}
                delay={tech.delay}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SkillsSection;
