export const initScrollAnimations = () => {
  // Configure the observer
  const observerOptions = {
    root: null, // viewport
    rootMargin: '0px',
    threshold: 0.1, // trigger when 10% of the element is visible
  };

  // Elements to observe (add class names as needed for different animations)
  const fadeInElements = document.querySelectorAll('.animate-fade-in');
  const slideUpElements = document.querySelectorAll('.animate-slide-up');
  const slideInLeftElements = document.querySelectorAll('.animate-slide-in-left');
  const slideInRightElements = document.querySelectorAll('.animate-slide-in-right');
  const scaleUpElements = document.querySelectorAll('.animate-scale-up');

  // Observer callback
  const handleIntersect = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Optionally unobserve after animation is triggered
        observer.unobserve(entry.target);
      }
    });
  };

  // Create and apply the observer
  const observer = new IntersectionObserver(handleIntersect, observerOptions);

  // Observe all elements
  fadeInElements.forEach(el => observer.observe(el));
  slideUpElements.forEach(el => observer.observe(el));
  slideInLeftElements.forEach(el => observer.observe(el));
  slideInRightElements.forEach(el => observer.observe(el));
  scaleUpElements.forEach(el => observer.observe(el));

  // Add necessary CSS classes for animations in index.css (or a separate animations.css file)
  const animationStyles = `
    /* Base styles for animated elements */
    .animate-fade-in,
    .animate-slide-up,
    .animate-slide-in-left,
    .animate-slide-in-right,
    .animate-scale-up {
      opacity: 0;
      transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }

    /* Fade in animation */
    .animate-fade-in.visible {
      opacity: 1;
    }

    /* Slide up animation */
    .animate-slide-up {
      transform: translateY(30px);
    }
    .animate-slide-up.visible {
      opacity: 1;
      transform: translateY(0);
    }

    /* Slide in from left animation */
    .animate-slide-in-left {
      transform: translateX(-50px);
    }
    .animate-slide-in-left.visible {
      opacity: 1;
      transform: translateX(0);
    }

    /* Slide in from right animation */
    .animate-slide-in-right {
      transform: translateX(50px);
    }
    .animate-slide-in-right.visible {
      opacity: 1;
      transform: translateX(0);
    }

    /* Scale up animation */
    .animate-scale-up {
      transform: scale(0.9);
    }
    .animate-scale-up.visible {
      opacity: 1;
      transform: scale(1);
    }

    /* Staggered delay classes */
    .delay-100 { transition-delay: 100ms; }
    .delay-200 { transition-delay: 200ms; }
    .delay-300 { transition-delay: 300ms; }
    .delay-400 { transition-delay: 400ms; }
    .delay-500 { transition-delay: 500ms; }
  `;

  // Add the styles to the document if they don't already exist
  if (!document.getElementById('animation-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'animation-styles';
    styleElement.textContent = animationStyles;
    document.head.appendChild(styleElement);
  }

  // Clean up function to remove the observer when component unmounts
  return () => {
    fadeInElements.forEach(el => observer.unobserve(el));
    slideUpElements.forEach(el => observer.unobserve(el));
    slideInLeftElements.forEach(el => observer.unobserve(el));
    slideInRightElements.forEach(el => observer.unobserve(el));
    scaleUpElements.forEach(el => observer.unobserve(el));
  };
};