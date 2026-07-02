import { useEffect, useState } from "react";

/**
 * Thin gradient bar pinned to the top of the viewport that tracks
 * overall scroll progress. Styled via the #progress rule in index.css.
 */
const ScrollProgressBar = () => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setWidth(Math.min(100, Math.max(0, pct)));
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return <div id="progress" style={{ width: `${width}%` }} aria-hidden="true" />;
};

export default ScrollProgressBar;
