import { useEffect } from "react";

/**
 * Twin-element glowing cursor (dot + trailing ring) shown on fine-pointer
 * devices only. The ring lags the dot for a fluid feel and swells over
 * interactive elements.
 */
const CustomCursor = () => {
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const dot = document.createElement("div");
    dot.id = "cursor-dot";
    const ring = document.createElement("div");
    ring.id = "cursor-ring";
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    };

    const loop = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;
      raf = requestAnimationFrame(loop);
    };

    const hotSelector = "a, button, input, textarea, .fbtn, .chip, [role='button']";
    const onOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement)?.closest?.(hotSelector)) {
        document.body.classList.add("cursor-hot");
      }
    };
    const onOut = (e: MouseEvent) => {
      if ((e.target as HTMLElement)?.closest?.(hotSelector)) {
        document.body.classList.remove("cursor-hot");
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mouseout", onOut);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout", onOut);
      document.body.classList.remove("cursor-hot");
      dot.remove();
      ring.remove();
    };
  }, []);

  return null;
};

export default CustomCursor;
