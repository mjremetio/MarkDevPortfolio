import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { Moon, Sun, Menu, X, Accessibility, ChevronDown } from "lucide-react";
import { smoothScrollTo } from "@/utils/smoothScroll";

// Primary links stay in the bar; the rest collapse into a "More" dropdown.
const primaryLinks = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Projects" },
  { href: "#credentials", label: "AI Practice" },
];
const moreLinks = [
  { href: "#services", label: "Services" },
  { href: "#experience", label: "Experience" },
  { href: "#gallery", label: "Gallery" },
  { href: "#resources", label: "Resources" },
];
// Full, page-ordered list for scroll-spy and the mobile menu.
const allLinks = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Projects" },
  { href: "#experience", label: "Experience" },
  { href: "#credentials", label: "AI Practice" },
  { href: "#gallery", label: "Gallery" },
  { href: "#resources", label: "Resources" },
  { href: "#contact", label: "Contact" },
];

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { togglePanel } = useAccessibility();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [active, setActive] = useState("home");
  const moreRef = useRef<HTMLDivElement>(null);

  // Scroll-spy: highlight the section currently in view.
  useEffect(() => {
    const ids = allLinks.map((l) => l.href.slice(1));
    const onScroll = () => {
      const pos = window.scrollY + 120;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && pos >= el.offsetTop) current = id;
      }
      setActive(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the "More" menu on outside click or Escape.
  useEffect(() => {
    if (!moreOpen) return;
    const onDown = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    setMoreOpen(false);
    smoothScrollTo(href);
  };

  const isActive = (href: string) => active === href.slice(1);
  const moreActive = moreLinks.some((l) => isActive(l.href));

  return (
    <header className="nav-shell">
      <div className="nav">
        <a
          className="logo"
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick("#home");
          }}
        >
          <span className="b">&lt;</span>MarkRemetio<span className="b">/&gt;</span>
        </a>

        <nav className="nav-links desktop">
          {primaryLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={isActive(link.href) ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(link.href);
              }}
            >
              {link.label}
            </a>
          ))}

          <div className="nav-more" ref={moreRef}>
            <button
              className={`nav-more-btn ${moreActive || moreOpen ? "active" : ""}`}
              aria-haspopup="true"
              aria-expanded={moreOpen}
              onClick={() => setMoreOpen((v) => !v)}
            >
              More
              <ChevronDown className={`nav-chev ${moreOpen ? "open" : ""}`} />
            </button>
            {moreOpen && (
              <div className="nav-dropdown" role="menu">
                {moreLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    role="menuitem"
                    className={isActive(link.href) ? "active" : ""}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link.href);
                    }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            className="nav-icon-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="h-[17px] w-[17px]" />
            ) : (
              <Sun className="h-[17px] w-[17px]" />
            )}
          </button>
          <button
            className="nav-icon-btn"
            onClick={togglePanel}
            aria-label="Accessibility settings"
          >
            <Accessibility className="h-[17px] w-[17px]" />
          </button>
          <a
            className="nav-cta"
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("#contact");
            }}
          >
            Hire Me
          </a>
          <button
            className="menu-btn nav-icon-btn"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsMobileMenuOpen((v) => !v)}
          >
            {isMobileMenuOpen ? (
              <X className="h-[18px] w-[18px]" />
            ) : (
              <Menu className="h-[18px] w-[18px]" />
            )}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <nav className="nav-links mobile">
          {allLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={isActive(link.href) ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(link.href);
              }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("#contact");
            }}
          >
            Hire Me
          </a>
        </nav>
      )}
    </header>
  );
};

export default Header;
