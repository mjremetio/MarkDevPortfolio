import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';

const ScrollProgressBar = () => {
  const { theme } = useTheme();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { 
    stiffness: 100, 
    damping: 30, 
    restDelta: 0.001 
  });
  
  const [visible, setVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  
  useEffect(() => {
    // Function to determine active section based on scroll position
    const determineActiveSection = () => {
      const sections = document.querySelectorAll('section[id]');
      const scrollPosition = window.scrollY + 100; // Offset for header
      
      sections.forEach(section => {
        const sectionTop = (section as HTMLElement).offsetTop;
        const sectionHeight = (section as HTMLElement).offsetHeight;
        const sectionId = section.getAttribute('id') || '';
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          setActiveSection(sectionId);
        }
      });
    };
    
    const handleScroll = () => {
      // Show progress bar only after scrolling down a bit
      if (window.scrollY > 100) {
        setVisible(true);
      } else {
        setVisible(false);
      }
      
      determineActiveSection();
    };
    
    window.addEventListener('scroll', handleScroll);
    determineActiveSection(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Map section IDs to readable names
  const sectionNames: Record<string, string> = {
    'hero': 'Home',
    'about': 'About',
    'skills': 'Skills',
    'experience': 'Experience',
    'projects': 'Projects',
    'gallery': 'Gallery',
    'contact': 'Contact'
  };

  return (
    <>
      {/* Main progress bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1.5 z-50 bg-gray-200 dark:bg-gray-700"
        style={{ 
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      >
        <motion.div 
          className="h-full bg-gradient-to-r from-primary-500 to-secondary-400 dark:from-primary-400 dark:to-secondary-500"
          style={{ 
            scaleX: scaleX,
            transformOrigin: 'left',
            width: '100%'
          }}
        />
      </motion.div>
      
      {/* Subtle glow effect for the progress bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1.5 z-49 blur-sm"
        style={{ 
          opacity: visible ? 0.5 : 0,
          transition: 'opacity 0.3s ease'
        }}
      >
        <motion.div 
          className="h-full bg-gradient-to-r from-primary-500 to-secondary-400 dark:from-primary-400 dark:to-secondary-500"
          style={{ 
            scaleX: scaleX,
            transformOrigin: 'left',
            width: '100%'
          }}
        />
      </motion.div>
      
      {/* Section indicator */}
      {activeSection && visible && (
        <motion.div 
          className="fixed top-2 right-4 z-50 bg-white dark:bg-gray-800 shadow-md rounded-full px-3 py-1 text-xs font-medium"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <span className="text-primary-600 dark:text-primary-400">
            {sectionNames[activeSection] || activeSection}
          </span>
        </motion.div>
      )}
    </>
  );
};

export default ScrollProgressBar;