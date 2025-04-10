export const smoothScrollTo = (targetId: string) => {
  const element = document.querySelector(targetId);
  
  if (element) {
    // Get the element's position relative to the viewport
    const rect = element.getBoundingClientRect();
    
    // Get the scroll position
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Calculate the target position
    const targetPosition = rect.top + scrollTop;
    
    // Adjust for fixed header (assuming header height is approximately 80px)
    const headerOffset = 80;
    const offsetPosition = targetPosition - headerOffset;
    
    // Smooth scroll to position
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};
