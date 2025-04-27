export const smoothScrollTo = (targetId: string) => {
  // If targetId starts with #, remove it
  const id = targetId.startsWith('#') ? targetId.substring(1) : targetId;
  
  const targetElement = document.getElementById(id);
  
  if (!targetElement) {
    console.error(`Element with ID '${id}' not found`);
    return;
  }
  
  // Offset for the fixed header (approximately 80px)
  const headerOffset = 80;
  
  // Get the target's position
  const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerOffset;
  
  // Get current position
  const startPosition = window.pageYOffset;
  
  // Calculate distance
  const distance = targetPosition - startPosition;
  
  // Determine the duration based on distance (further = longer duration)
  const duration = Math.min(1000, Math.max(500, Math.abs(distance) / 3));
  
  let startTimestamp: number | null = null;
  
  // Animation function
  function step(timestamp: number) {
    if (!startTimestamp) startTimestamp = timestamp;
    
    const progress = Math.min(1, (timestamp - startTimestamp) / duration);
    
    // Easing function - easeInOutCubic
    const easeProgress = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    
    window.scrollTo({
      top: startPosition + distance * easeProgress,
    });
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  }
  
  // Start animation
  window.requestAnimationFrame(step);
};