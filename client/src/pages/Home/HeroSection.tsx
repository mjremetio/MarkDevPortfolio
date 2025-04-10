import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { smoothScrollTo } from "@/utils/smoothScroll";
import { downloadResume } from "@/utils/downloadResume";
import { ChevronDown } from "lucide-react";

const HeroSection = () => {
  return (
    <section 
      id="home" 
      className="min-h-screen flex items-center pt-16 bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300"
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
              <span className="text-gray-900 dark:text-white">Hi, I'm </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">Mark Remetio</span>
            </h1>
            <h2 className="text-2xl md:text-3xl font-medium text-gray-700 dark:text-gray-300">Web Designer & Developer</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg">
              Versatile and detail-oriented Web Developer with 5 years of hands-on experience specializing in both Front-End and Back-End development.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button 
                className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-300 shadow-md hover:shadow-lg"
                onClick={() => smoothScrollTo('#contact')}
              >
                Get in Touch
              </Button>
              <Button 
                variant="outline"
                className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-medium rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 shadow-md hover:shadow-lg"
                onClick={() => smoothScrollTo('#projects')}
              >
                View Projects
              </Button>
              <Button 
                variant="outline"
                className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-medium rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 shadow-md hover:shadow-lg flex items-center"
                onClick={downloadResume}
              >
                <i className="fas fa-download mr-2"></i> Resume
              </Button>
            </div>
            <div className="flex items-center gap-4 pt-4">
              <a href="https://www.linkedin.com/in/mark-joseph-remetio-11b58a18a/" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-xl transition-colors duration-200">
                <i className="fab fa-linkedin"></i>
              </a>
              <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-xl transition-colors duration-200">
                <i className="fab fa-github"></i>
              </a>
              <a href="mailto:mj.remetio001@gmail.com" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-xl transition-colors duration-200">
                <i className="fas fa-envelope"></i>
              </a>
            </div>
          </motion.div>
          <motion.div 
            className="w-full md:w-1/2 flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative">
              <div className="w-64 h-64 md:w-80 md:h-80 overflow-hidden rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 p-1">
                <div className="bg-white dark:bg-gray-900 rounded-full w-full h-full flex items-center justify-center overflow-hidden">
                  <img 
                    src="/images/profile.svg" 
                    alt="Mark Remetio" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
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
