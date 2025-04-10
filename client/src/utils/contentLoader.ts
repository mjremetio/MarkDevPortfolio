import heroContent from '../content/hero.json';
import aboutContent from '../content/about.json';
import skillsContent from '../content/skills.json';
import projectsContent from '../content/projects.json';
import experienceContent from '../content/experience.json';
import contactContent from '../content/contact.json';

export const getHeroContent = () => heroContent;
export const getAboutContent = () => aboutContent;
export const getSkillsContent = () => skillsContent;
export const getProjectsContent = () => projectsContent;
export const getExperienceContent = () => experienceContent;
export const getContactContent = () => contactContent;

// Generic content loader
export const getContent = (section: string) => {
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
    default:
      return null;
  }
};

// For updating content via API (to be implemented)
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
      throw new Error('Failed to update content');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating content:', error);
    throw error;
  }
};