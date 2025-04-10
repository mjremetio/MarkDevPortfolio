import { motion } from "framer-motion";

const AboutSection = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section id="about" className="py-16 md:py-24 bg-white dark:bg-gray-800 transition-colors duration-300">
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
              <div className="rounded-lg overflow-hidden shadow-xl transform transition-transform duration-300 hover:scale-[1.02]">
                <svg className="w-full h-64 text-gray-200 dark:text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-70"></div>
              </div>
              <div className="absolute bottom-6 left-6 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md">
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  <span className="text-primary-600 dark:text-primary-400 font-bold">5+ Years</span> Experience
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
              Versatile Full-Stack Web Developer & Designer
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Detail-oriented Web Developer with nearly 5 years of hands-on experience specializing in both Front-End and Back-End development, including UI/UX design and server management. Proven track record in deploying live applications and driving their market presence, demonstrating a keen understanding of the complete development lifecycle.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              I'm passionate about creating clean, efficient code and intuitive user experiences. My expertise spans from crafting visually appealing interfaces to implementing robust back-end systems and managing server infrastructure.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <motion.div 
                className="flex items-start"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full mr-4">
                  <i className="fas fa-laptop-code text-primary-600 dark:text-primary-400"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white">Front-End Development</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">Creating responsive, interactive user interfaces with modern frameworks</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full mr-4">
                  <i className="fas fa-server text-primary-600 dark:text-primary-400"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white">Back-End Systems</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">Building secure, scalable API endpoints and database architectures</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full mr-4">
                  <i className="fas fa-paint-brush text-primary-600 dark:text-primary-400"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white">UI/UX Design</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">Designing intuitive, aesthetically pleasing user experiences</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full mr-4">
                  <i className="fas fa-cloud text-primary-600 dark:text-primary-400"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white">Cloud Infrastructure</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">Managing AWS services and server environments</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
