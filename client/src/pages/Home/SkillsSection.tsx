import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { getSkillsContent } from "@/utils/contentLoader";
import { useContentLoading } from "@/contexts/ContentLoadingContext";

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
      <div className="flex justify-between mb-1.5">
        <motion.span
          className="text-sm font-medium text-gray-600 dark:text-gray-300"
          initial={{ x: 0 }}
          animate={{ x: isHovered ? 2 : 0 }}
          transition={{ type: "spring", stiffness: 300 }}
          style={{ fontWeight: isHovered ? 600 : 500 }}
        >
          {name}
        </motion.span>
        <motion.span
          className="text-sm font-semibold text-indigo-600 dark:text-indigo-400"
          initial={{ scale: 1 }}
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {percentage}%
        </motion.span>
      </div>
      <div
        className={`progress-bar bg-gray-100 dark:bg-slate-700 ${isHovered ? 'h-3' : 'h-2.5'} rounded-full overflow-hidden transition-all duration-300`}
      >
        <div
          ref={progressRef}
          className="progress-bar-fill h-full w-0 rounded-full transition-all duration-1000 ease-out"
          style={{ boxShadow: isHovered ? "0 0 8px rgba(99, 102, 241, 0.4)" : "none" }}
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
        className="w-16 h-16 flex items-center justify-center bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/50"
        whileHover={{
          scale: 1.1,
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
        }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <i className={`${icon} text-3xl`}></i>
      </motion.div>
      <motion.span
        className="mt-2 text-sm text-gray-500 dark:text-gray-400"
        whileHover={{ fontWeight: 600 }}
      >
        {name}
      </motion.span>
    </motion.div>
  );
};

const SkillsSection = () => {
  const [content, setContent] = useState(getSkillsContent());
  const { beginLoading, endLoading } = useContentLoading();

  useEffect(() => {
    let isMounted = true;
    const loadSkillsContent = async () => {
      beginLoading();
      try {
        const response = await fetch("/api/content/skills");
        if (!response.ok) {
          throw new Error("Failed to fetch skills content");
        }
        const data = await response.json();
        if (isMounted) {
          setContent(data);
        }
      } catch (error) {
        console.log("Using default skills content:", error);
      } finally {
        endLoading();
      }
    };

    void loadSkillsContent();
    return () => {
      isMounted = false;
    };
  }, [beginLoading, endLoading]);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section id="skills" className="py-16 md:py-24 section-alt transition-colors duration-500">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-sans text-gray-900 dark:text-white">{content.title}</h2>
          <div className="section-divider"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            {content.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.categories?.map((category: SkillCategory, categoryIndex: number) => (
            <motion.div
              key={category.title}
              className="card-enhanced bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700/50"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
            >
              <div className="p-6">
                <div className="flex items-center mb-5">
                  <div className={`${category.iconBg} p-3 rounded-xl mr-4`}>
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
            <div className="tech-slider pr-8">
              {content.technologies?.map((tech: Technology, index: number) => (
                <TechIcon
                  key={`first-${tech.name}`}
                  icon={tech.icon}
                  name={tech.name}
                  delay={index}
                />
              ))}

              {content.technologies?.map((tech: Technology, index: number) => (
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
