import { toast } from "@/hooks/use-toast";
import { defaultContent } from "@shared/defaultContent";

type AboutFeature = {
  title: string;
  description: string;
  icon: string;
};

type StatItem = {
  label: string;
  value: string;
};

type HeroCTA = {
  text: string;
  link: string;
  primary: boolean;
  icon: string;
  downloadAction?: boolean;
};

type HeroBadge = {
  text: string;
  bgColor: string;
  textColor: string;
  darkBgColor: string;
  darkTextColor: string;
};

type HeroStat = {
  value: string;
  label: string;
  icon: string;
};

type HeroContent = {
  greeting: string;
  name: string;
  title: string;
  shortDescription: string;
  ctaButtons: HeroCTA[];
  stats: HeroStat[];
  badges: HeroBadge[];
  profilePicture?: string;
};

export type AboutContentData = {
  title: string;
  subtitle?: string;
  description: string[];
  profilePicture?: string;
  imageAlt?: string;
  experience?: string;
  features?: AboutFeature[];
  statItems?: StatItem[];
};

type SkillItem = {
  name: string;
  percentage: number;
  colorClass: string;
};

type SkillCategory = {
  title: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  titleColor: string;
  skills: SkillItem[];
};

type SkillsContentData = {
  title: string;
  subtitle: string;
  description: string;
  categories: SkillCategory[];
  technologies: Array<{ name: string; icon: string }>;
};

type ProjectItem = {
  title: string;
  description: string;
  imagePlaceholder: string;
  technologies: string[];
  githubLink?: string;
  liveLink?: string;
};

type ProjectsContentData = {
  title: string;
  subtitle: string;
  description: string;
  projects: ProjectItem[];
};

type ExperienceItem = {
  title: string;
  company: string;
  period: string;
  responsibilities: string[];
};

type ExperienceContentData = {
  title: string;
  subtitle?: string;
  description?: string;
  experiences: ExperienceItem[];
};

type ContactContentData = {
  title: string;
  subtitle?: string;
  description?: string;
  email: string;
  contactInfo?: Array<{
    type: string;
    value: string;
    link?: string;
    icon?: string;
  }>;
  socialLinks: Array<{ name: string; url: string; icon: string }>;
  availableFor?: Array<{
    type: string;
    bgClass: string;
    textClass: string;
    darkBgClass: string;
    darkTextClass: string;
  }>;
  formLabels: {
    name: string;
    email: string;
    subject: string;
    message: string;
    button: string;
  };
  formFields?: Array<Record<string, unknown>>;
};

type GalleryContentData = {
  title: string;
  subtitle: string;
  description: string;
  images: string[];
};

// Shared default content (read-only, comes from Supabase seed data)
const heroContent = defaultContent.hero as HeroContent;
const aboutContent = defaultContent.about as AboutContentData;
const skillsContent = defaultContent.skills as SkillsContentData;
const projectsContent = defaultContent.projects as ProjectsContentData;
const experienceContent = defaultContent.experience as ExperienceContentData;
const contactContent = defaultContent.contact as ContactContentData;
const galleryContent = defaultContent.gallery as GalleryContentData;

// Helper functions for API calls
export const getHeroContent = () => heroContent;
export const getAboutContent = (): AboutContentData => aboutContent;
export const getSkillsContent = (): SkillsContentData => skillsContent;
export const getProjectsContent = (): ProjectsContentData => projectsContent;
export const getExperienceContent = (): ExperienceContentData =>
  experienceContent;
export const getContactContent = (): ContactContentData => contactContent;
export const getGalleryContent = (): GalleryContentData => galleryContent;

// Function to fetch content from the API
export const getContent = async (section: string) => {
  try {
    const response = await fetch(`/api/content/${section}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${section} content`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${section} content:`, error);
    toast({
      title: "Error",
      description: `Failed to load ${section} content. Using fallback data.`,
      variant: "destructive",
    });
    
    // Return default content as fallback
    switch (section) {
      case 'hero':
        return heroContent;
      case 'about':
        return aboutContent;
      case 'skills':
        return skillsContent;
      case 'projects':
        return projectsContent;
      case 'experience':
        return experienceContent;
      case 'contact':
        return contactContent;
      case 'gallery':
        return galleryContent;
      default:
        return null;
    }
  }
};

// Function to update content via the API
export const updateContent = async (section: string, content: any) => {
  try {
    const response = await fetch(`/api/content/${section}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(content),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to update ${section} content`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error updating ${section} content:`, error);
    throw error;
  }
};
