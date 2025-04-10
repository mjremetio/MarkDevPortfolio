import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { getAboutContent } from "@/utils/contentLoader";

const AboutSection = () => {
  const [content, setContent] = useState(getAboutContent());
  
  useEffect(() => {
    // Attempt to fetch updated content from API
    fetch('/api/content/about')
      .then(response => {
        if (response.ok) return response.json();
        throw new Error('Failed to fetch about content');
      })
      .then(data => {
        setContent(data);
      })
      .catch(error => {
        console.log('Using default about content:', error);
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
    <section id="about" className="py-16 md:py-24 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-sans text-gray-900 dark:text-white">About Me</h2>
          <div className="mt-3 w-16 h-1 bg-gradient-to-r from-primary-600 to-secondary-500 mx-auto rounded-full"></div>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center gap-10">
          <motion.div 
            className="w-full lg:w-2/5"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              <div className="rounded-lg overflow-hidden shadow-xl transform transition-transform duration-300 hover:scale-[1.02] border-2 border-gray-100 dark:border-gray-700">
                <img 
                  src="/images/profile-photo.png" 
                  alt="Mark Remetio" 
                  className="w-full h-64 object-contain bg-gray-50 dark:bg-gray-800"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-500/20 to-transparent"></div>
              </div>
              <div className="absolute bottom-6 left-6 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md">
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  <span className="text-primary-600 dark:text-primary-400 font-bold">{content.experience}</span> Experience
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="w-full lg:w-3/5 mt-10 lg:mt-0"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              {content.title}
            </h3>
            {content.description?.map((paragraph, index) => (
              <p key={index} className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                {paragraph}
              </p>
            ))}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {content.features?.map((feature, index) => (
                <motion.div 
                  key={index}
                  className="flex items-start"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 * (index + 1) }}
                >
                  <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full mr-4">
                    <i className={`fas fa-${feature.icon} text-primary-600 dark:text-primary-400`}></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">{feature.title}</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
