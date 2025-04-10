import { smoothScrollTo } from "@/utils/smoothScroll";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const handleNavClick = (href: string) => {
    smoothScrollTo(href);
  };

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h3 className="text-xl font-bold">
              <span className="text-primary-400">&lt;</span>Mark Remetio<span className="text-primary-400">/&gt;</span>
            </h3>
            <p className="text-gray-400 mt-2">Web Designer & Developer</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
            <nav className="flex space-x-6">
              <a 
                href="#home" 
                onClick={(e) => { e.preventDefault(); handleNavClick('#home'); }}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Home
              </a>
              <a 
                href="#about" 
                onClick={(e) => { e.preventDefault(); handleNavClick('#about'); }}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                About
              </a>
              <a 
                href="#skills" 
                onClick={(e) => { e.preventDefault(); handleNavClick('#skills'); }}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Skills
              </a>
              <a 
                href="#experience" 
                onClick={(e) => { e.preventDefault(); handleNavClick('#experience'); }}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Experience
              </a>
              <a 
                href="#projects" 
                onClick={(e) => { e.preventDefault(); handleNavClick('#projects'); }}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Projects
              </a>
              <a 
                href="#contact" 
                onClick={(e) => { e.preventDefault(); handleNavClick('#contact'); }}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Contact
              </a>
            </nav>
          </div>
        </div>
        
        <hr className="border-gray-800 my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">&copy; {currentYear} Mark Remetio. All rights reserved.</p>
          
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a 
              href="https://www.linkedin.com/in/mark-joseph-remetio-11b58a18a/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-white transition-colors duration-200"
              aria-label="LinkedIn"
            >
              <i className="fab fa-linkedin-in"></i>
            </a>
            <a 
              href="https://github.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-white transition-colors duration-200"
              aria-label="GitHub"
            >
              <i className="fab fa-github"></i>
            </a>
            <a 
              href="https://twitter.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-white transition-colors duration-200"
              aria-label="Twitter"
            >
              <i className="fab fa-twitter"></i>
            </a>
            <a 
              href="mailto:mj.remetio001@gmail.com" 
              className="text-gray-400 hover:text-white transition-colors duration-200"
              aria-label="Email"
            >
              <i className="fas fa-envelope"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
