import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { smoothScrollTo } from "@/utils/smoothScroll";
import { downloadResume } from "@/utils/downloadResume";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { getHeroContent } from "@/utils/contentLoader";

const HeroSection = () => {
  const [content, setContent] = useState(getHeroContent());
  
  useEffect(() => {
    // Attempt to fetch updated content from API
    fetch('/api/content/hero')
      .then(response => {
        if (response.ok) return response.json();
        throw new Error('Failed to fetch hero content');
      })
      .then(data => {
        setContent(data);
      })
      .catch(error => {
        console.log('Using default hero content:', error);
        // On error, use the local content (already set as default)
      });
  }, []);
  return (
    <section 
      id="home" 
      className="min-h-screen flex items-center pt-16 bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-800 transition-colors duration-300"
    >
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          <motion.div 
            className="w-full md:w-1/2 space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-sans leading-tight">
              <span className="text-gray-900 dark:text-white">{content.greeting} </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">{content.name}</span>
            </h1>
            <h2 className="text-2xl md:text-3xl font-medium text-gray-700 dark:text-gray-300">{content.title}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg">
              {content.shortDescription}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              {content.ctaButtons?.map((button, index) => (
                <Button 
                  key={index}
                  variant={button.primary ? "default" : "outline"}
                  className={`${button.primary ? 
                    "bg-primary-600 text-white hover:bg-primary-700" : 
                    "bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"} 
                    px-6 py-3 font-medium rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg flex items-center`}
                  onClick={() => button.downloadAction ? downloadResume() : smoothScrollTo(button.link)}
                >
                  {button.icon && <i className={`fas fa-${button.icon} mr-2`}></i>} {button.text}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-4 pt-4">
              {/* Stats section */}
              <div className="flex flex-wrap gap-5 pt-6">
                {content.stats?.map((stat, index) => (
                  <div key={index} className="flex items-center">
                    <div className="text-primary-600 dark:text-primary-400 mr-2">
                      <i className={`fas fa-${stat.icon} text-lg`}></i>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Badges section */}
            <div className="flex flex-wrap gap-2 pt-4">
              {content.badges?.map((badge, index) => (
                <span 
                  key={index}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium 
                    ${badge.bgColor} ${badge.textColor} ${badge.darkBgColor} ${badge.darkTextColor}`}
                >
                  {badge.text}
                </span>
              ))}
            </div>
          </motion.div>
          <motion.div 
            className="w-full md:w-1/2 flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative">
              <motion.div 
                className="w-64 h-64 md:w-80 md:h-80 overflow-hidden rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 p-1"
                animate={{ 
                  boxShadow: [
                    "0 0 10px rgba(79, 70, 229, 0.4)",
                    "0 0 20px rgba(79, 70, 229, 0.6)",
                    "0 0 10px rgba(79, 70, 229, 0.4)"
                  ],
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 3
                }}
              >
                <motion.div 
                  className="bg-white dark:bg-gray-900 rounded-full w-full h-full flex items-center justify-center overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img 
                    src="/images/profile.svg" 
                    alt="Mark Remetio" 
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </motion.div>
              <motion.div 
                className="absolute -bottom-4 -right-4 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg border-4 border-gray-100 dark:border-gray-900"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="bg-gradient-to-br from-primary-500 to-secondary-500 text-white p-2 rounded-full">
                  <i className="fas fa-code text-2xl"></i>
                </div>
              </motion.div>
              <motion.div 
                className="absolute -top-4 -left-4 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg border-4 border-gray-100 dark:border-gray-900"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="bg-gradient-to-br from-primary-500 to-secondary-500 text-white p-2 rounded-full">
                  <i className="fas fa-paint-brush text-2xl"></i>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 hidden md:block"
          animate={{ 
            y: [0, 10, 0],
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 2
          }}
        >
          <a 
            href="#about" 
            onClick={(e) => { e.preventDefault(); smoothScrollTo('#about'); }}
            className="text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400"
          >
            <ChevronDown className="h-8 w-8" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
