const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-left">
            <div className="logo">
              <span className="b">&lt;</span>MarkRemetio<span className="b">/&gt;</span>
            </div>
            <p>Web Designer &amp; Developer</p>
          </div>
          <div className="socials">
            <a
              href="https://www.linkedin.com/in/mark-joseph-remetio-11b58a18a/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <i className="fab fa-linkedin-in"></i>
            </a>
            <a
              href="https://github.com/mjremetio"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <i className="fab fa-github"></i>
            </a>
            <a href="mailto:mj.remetio001@gmail.com" aria-label="Email">
              <i className="fas fa-envelope"></i>
            </a>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© {currentYear} Mark Remetio. All rights reserved.</span>
          <span className="mono">Crafted with React · Three.js · Tailwind</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
