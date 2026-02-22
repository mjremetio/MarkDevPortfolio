import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { Moon, Sun, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { smoothScrollTo } from "@/utils/smoothScroll";
import AccessibilityToggle from "@/components/AccessibilityToggle";

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '#home', label: 'Home' },
    { href: '#about', label: 'About' },
    { href: '#skills', label: 'Skills' },
    { href: '#experience', label: 'Experience' },
    { href: '#projects', label: 'Projects' },
    { href: '#gallery', label: 'Gallery' },
    { href: '#contact', label: 'Contact' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    smoothScrollTo(href);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'header-glass-scrolled' : 'header-glass'
    }`}>
      <div className="container mx-auto px-4 md:px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => { e.preventDefault(); handleNavClick('#home'); }}
            className="text-xl md:text-2xl font-bold font-sans tracking-tight group"
          >
            <span className="text-indigo-600 dark:text-indigo-400 transition-colors">&lt;</span>
            <span className="text-gray-900 dark:text-white transition-colors">Mark Remetio</span>
            <span className="text-indigo-600 dark:text-indigo-400 transition-colors">/&gt;</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                className="nav-link text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {link.label}
              </a>
            ))}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="theme-toggle rounded-full w-9 h-9 focus:outline-none"
              aria-label="Toggle dark mode"
            >
              {theme === 'light' ? (
                <Moon className="h-[18px] w-[18px] text-indigo-600" />
              ) : (
                <Sun className="h-[18px] w-[18px] text-amber-400" />
              )}
            </Button>
            <AccessibilityToggle />
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="theme-toggle rounded-full w-9 h-9 focus:outline-none"
              aria-label="Toggle dark mode"
            >
              {theme === 'light' ? (
                <Moon className="h-[18px] w-[18px] text-indigo-600" />
              ) : (
                <Sun className="h-[18px] w-[18px] text-amber-400" />
              )}
            </Button>
            <AccessibilityToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 dark:text-gray-300 focus:outline-none"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${
          isMobileMenuOpen ? 'max-h-96 opacity-100 mt-4 pb-2' : 'max-h-0 opacity-0'
        }`}>
          <nav className="flex flex-col space-y-3 py-2 border-t border-gray-200 dark:border-gray-700/50">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 py-1"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
