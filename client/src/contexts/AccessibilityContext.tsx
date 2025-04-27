import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the accessibility settings types
export type ColorTheme = 'default' | 'high-contrast' | 'dark' | 'light';
export type FontSize = 'small' | 'medium' | 'large' | 'x-large';
export type FontFamily = 'sans-serif' | 'serif' | 'dyslexic';

export interface AccessibilitySettings {
  colorTheme: ColorTheme;
  fontSize: FontSize;
  fontFamily: FontFamily;
  reducedAnimations: boolean;
  lineHeight: number; // 1.0 - 2.0
  letterSpacing: number; // 0 - 10
  enhancedFocus: boolean;
}

// Default settings
export const defaultSettings: AccessibilitySettings = {
  colorTheme: 'default',
  fontSize: 'medium',
  fontFamily: 'sans-serif',
  reducedAnimations: false,
  lineHeight: 1.5,
  letterSpacing: 0,
  enhancedFocus: false,
};

// Define the context type
interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  resetSettings: () => void;
  isOpen: boolean;
  togglePanel: () => void;
}

// Create the context
export const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

// Provider component
export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

  // Load settings from localStorage on initial render
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      } catch (error) {
        console.error('Failed to parse accessibility settings:', error);
        // If parsing fails, reset to defaults
        localStorage.removeItem('accessibility-settings');
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  // Apply global CSS variables based on settings
  useEffect(() => {
    const root = document.documentElement;

    // Font size
    switch (settings.fontSize) {
      case 'small':
        root.style.setProperty('--a11y-font-scale', '0.9');
        break;
      case 'medium':
        root.style.setProperty('--a11y-font-scale', '1');
        break;
      case 'large':
        root.style.setProperty('--a11y-font-scale', '1.2');
        break;
      case 'x-large':
        root.style.setProperty('--a11y-font-scale', '1.4');
        break;
    }

    // Font family
    switch (settings.fontFamily) {
      case 'sans-serif':
        root.style.setProperty('--a11y-font-family', 'var(--font-sans)');
        break;
      case 'serif':
        root.style.setProperty('--a11y-font-family', 'serif');
        break;
      case 'dyslexic':
        root.style.setProperty('--a11y-font-family', '"Open Dyslexic", sans-serif');
        break;
    }

    // Line height
    root.style.setProperty('--a11y-line-height', settings.lineHeight.toString());
    
    // Letter spacing
    root.style.setProperty('--a11y-letter-spacing', `${settings.letterSpacing}px`);

    // Enhanced focus
    if (settings.enhancedFocus) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }

    // Reduced animations
    if (settings.reducedAnimations) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Color theme - handled by ThemeProvider component separately
    // For high-contrast we add a special class
    if (settings.colorTheme === 'high-contrast') {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

  }, [settings]);

  // Update settings function
  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Reset settings function
  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  // Toggle panel function
  const togglePanel = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <AccessibilityContext.Provider value={{
      settings,
      updateSettings,
      resetSettings,
      isOpen,
      togglePanel,
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

// Custom hook for using the context
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};