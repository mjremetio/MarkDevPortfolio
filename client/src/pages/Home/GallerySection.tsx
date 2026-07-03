import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { getGalleryContent } from "@/utils/contentLoader";
import { useContentLoading } from "@/contexts/ContentLoadingContext";
import { getRenderableImageSource } from "@/utils/imagePath";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryContent {
  title: string;
  subtitle: string;
  description: string;
  images: string[];
}

const PLACEHOLDERS = [
  "Web Dashboard",
  "E-commerce Website",
  "Mobile App Design",
  "Educational Platform",
  "Analytics Dashboard",
  "Admin Panel",
  "Landing Page",
  "CRM System",
];

const GallerySection = () => {
  const [content, setContent] = useState<GalleryContent>(
    getGalleryContent() as GalleryContent
  );
  const { beginLoading, endLoading } = useContentLoading();
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [dims, setDims] = useState({ w: 260, h: 166, radius: 900 });

  const ringRef = useRef<HTMLDivElement>(null);
  const rot = useRef(0);
  const vel = useRef(0);
  const target = useRef<number | null>(null);
  const dragging = useRef(false);
  const hovering = useRef(false);
  const auto = useRef(true); // gentle auto-spin until the user interacts
  const lastX = useRef(0);
  const dragDist = useRef(0);

  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      beginLoading();
      try {
        const res = await fetch("/api/content/gallery");
        if (!res.ok) throw new Error("Failed to fetch gallery content");
        const data = await res.json();
        if (isMounted) setContent(data);
      } catch (error) {
        console.log("Using default gallery content:", error);
      } finally {
        endLoading();
      }
    };
    void load();
    return () => {
      isMounted = false;
    };
  }, [beginLoading, endLoading]);

  const images = useMemo(() => {
    const src = content.images && content.images.length ? content.images : [];
    return src.map((s) => getRenderableImageSource(s)).filter(Boolean) as string[];
  }, [content.images]);

  const hasImages = images.length > 0;
  const cells = hasImages ? images : PLACEHOLDERS.map(() => "");
  const n = Math.max(cells.length, 1);
  const step = 360 / n;

  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth;
      const w = vw < 560 ? 152 : vw < 900 ? 200 : 260;
      const h = Math.round(w * 0.64);
      const radius = Math.round(w / 2 / Math.tan(Math.PI / n)) + (vw < 560 ? 22 : 48);
      setDims({ w, h, radius });
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [n]);

  // Rotation loop: eased snap to a target (buttons), else drag momentum, else a
  // gentle auto-spin that pauses on hover and stops once the user interacts.
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      if (target.current !== null) {
        rot.current += (target.current - rot.current) * 0.14;
        if (Math.abs(target.current - rot.current) < 0.05) {
          rot.current = target.current;
          target.current = null;
        }
      } else if (!dragging.current) {
        if (auto.current && !reduce && !hovering.current) {
          rot.current -= 0.05;
        } else {
          vel.current *= 0.9;
          if (Math.abs(vel.current) < 0.01) vel.current = 0;
          rot.current += vel.current;
        }
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translateZ(${-dims.radius}px) rotateY(${rot.current}deg)`;
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [dims.radius, reduce]);

  // Drag via window listeners (no pointer-capture) so cell/button clicks still fire.
  const onStageDown = (e: React.PointerEvent) => {
    dragging.current = true;
    target.current = null;
    auto.current = false;
    lastX.current = e.clientX;
    dragDist.current = 0;
    vel.current = 0;
    const move = (ev: PointerEvent) => {
      if (!dragging.current) return;
      const dx = ev.clientX - lastX.current;
      lastX.current = ev.clientX;
      dragDist.current += Math.abs(dx);
      const d = dx * 0.28;
      rot.current += d;
      vel.current = d;
    };
    const up = () => {
      dragging.current = false;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const nudge = (dir: number) => {
    auto.current = false;
    const base = target.current ?? Math.round(rot.current / step) * step;
    target.current = base + dir * step;
  };

  const openCell = (idx: number) => {
    if (dragDist.current < 8 && hasImages) setLightboxIdx(idx);
  };

  // Keyboard: arrows browse the lightbox, Esc closes.
  useEffect(() => {
    if (lightboxIdx === null) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIdx(null);
      else if (e.key === "ArrowRight") setLightboxIdx((i) => (i === null ? i : (i + 1) % images.length));
      else if (e.key === "ArrowLeft") setLightboxIdx((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [lightboxIdx, images.length]);

  return (
    <section id="gallery">
      <div className="wrap">
        <motion.div
          className="section-head"
          style={{ textAlign: "center" }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="eyebrow center">// gallery.snapshots</div>
          <h2 className="h2">
            Project <span className="grad">Gallery</span>
          </h2>
          <p className="sub" style={{ marginLeft: "auto", marginRight: "auto" }}>
            {content.description}
          </p>
        </motion.div>

        <div
          className="g3d-stage"
          style={{ height: dims.h + 210 }}
          onPointerDown={onStageDown}
          onPointerEnter={() => (hovering.current = true)}
          onPointerLeave={() => (hovering.current = false)}
        >
          <div className="g3d-ring" ref={ringRef}>
            {cells.map((src, i) => (
              <div
                className="g3d-cell"
                key={i}
                data-idx={i}
                style={{
                  width: dims.w,
                  height: dims.h,
                  marginLeft: -dims.w / 2,
                  marginTop: -dims.h / 2,
                  transform: `rotateY(${i * step}deg) translateZ(${dims.radius}px)`,
                  cursor: hasImages ? "zoom-in" : "grab",
                }}
                onClick={() => openCell(i)}
              >
                {src ? (
                  <img src={src} alt={`Gallery ${i + 1}`} decoding="async" draggable={false} />
                ) : (
                  <div className="g3d-ph">{PLACEHOLDERS[i % PLACEHOLDERS.length]}</div>
                )}
                <span className="g3d-shade" />
              </div>
            ))}
          </div>

          <button
            className="g3d-nav prev"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => nudge(-1)}
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            className="g3d-nav next"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => nudge(1)}
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="g3d-hint">
          drag to rotate · click an image to view{hasImages ? ` · ${images.length} shots` : ""}
        </div>
      </div>

      {lightboxIdx !== null && hasImages && (
        <div className="g3d-lightbox" onClick={() => setLightboxIdx(null)}>
          <button className="g3d-close" aria-label="Close" onClick={() => setLightboxIdx(null)}>
            <X className="h-5 w-5" />
          </button>
          <button
            className="g3d-lb-nav prev"
            aria-label="Previous image"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIdx((i) => (i === null ? i : (i - 1 + images.length) % images.length));
            }}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <img
            src={images[lightboxIdx]}
            alt={`Gallery ${lightboxIdx + 1}`}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="g3d-lb-nav next"
            aria-label="Next image"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIdx((i) => (i === null ? i : (i + 1) % images.length));
            }}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <span className="g3d-lb-count">
            {lightboxIdx + 1} / {images.length}
          </span>
        </div>
      )}
    </section>
  );
};

export default GallerySection;
