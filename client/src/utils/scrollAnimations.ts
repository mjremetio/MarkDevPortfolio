export const initScrollAnimations = () => {
  // Animate progress bars when they come into view
  const animateProgressBars = () => {
    const progressBars = document.querySelectorAll('.progress-bar-fill');
    
    progressBars.forEach(bar => {
      const element = bar as HTMLElement;
      const rect = element.getBoundingClientRect();
      const isVisible = (
        rect.top >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
      );
      
      // Get percentage from parent element
      if (isVisible && element.parentElement) {
        const percentElement = element.parentElement.querySelector('[class*="text-primary-"], [class*="text-secondary-"], [class*="text-blue-"]');
        if (percentElement) {
          const percentage = percentElement.textContent?.replace('%', '') || '0';
          if (element.style.width !== `${percentage}%`) {
            element.style.width = `${percentage}%`;
          }
        }
      }
    });
  };
  
  // Setup observation for timeline items
  const timelineItems = document.querySelectorAll('.timeline-item');
  timelineItems.forEach(item => {
    const element = item as HTMLElement;
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });
  
  const animateTimelineItems = () => {
    timelineItems.forEach((item, index) => {
      const element = item as HTMLElement;
      const rect = element.getBoundingClientRect();
      const isVisible = (
        rect.top >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
      );
      
      if (isVisible) {
        setTimeout(() => {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }, index * 150);
      }
    });
  };
  
  // Attach scroll listeners
  window.addEventListener('scroll', animateProgressBars);
  window.addEventListener('scroll', animateTimelineItems);
  
  // Initial call to animate elements that are already visible
  animateProgressBars();
  animateTimelineItems();
  
  return () => {
    // Clean up event listeners when component unmounts
    window.removeEventListener('scroll', animateProgressBars);
    window.removeEventListener('scroll', animateTimelineItems);
  };
};
