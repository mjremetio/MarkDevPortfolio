import { toast } from "@/hooks/use-toast";

// Initial default content - will be replaced by API calls
const heroContent = {
  greeting: "Hello, I'm",
  name: "Mark Remetio",
  title: "Full-Stack Web Developer",
  description: "I build responsive, user-friendly web applications with modern technologies.",
  ctaButton: "View My Work",
  ctaButtonLink: "#projects",
  resumeButton: "Download Resume"
};

const aboutContent = {
  title: "Versatile Full-Stack Web Developer",
  subtitle: "About Me",
  description: [
    "I am a passionate full-stack developer with over 5 years of experience building web applications that deliver exceptional user experiences.",
    "My expertise spans front-end and back-end technologies, with a focus on React, Node.js, and modern JavaScript frameworks.",
    "I'm committed to writing clean, maintainable code and staying up-to-date with the latest industry standards and best practices."
  ],
  profilePicture: "/profile-image.svg",
  imageAlt: "Mark Remetio profile picture",
  experience: "5+ Years",
  features: [
    {
      title: "Front-End Development",
      description: "Creating responsive, interactive user interfaces with modern frameworks",
      icon: "laptop-code"
    },
    {
      title: "Back-End Systems",
      description: "Building secure, scalable API endpoints and database architectures",
      icon: "server"
    },
    {
      title: "UI/UX Design",
      description: "Designing intuitive, aesthetically pleasing user experiences",
      icon: "paint-brush"
    },
    {
      title: "Cloud Infrastructure",
      description: "Managing AWS services and server environments",
      icon: "cloud"
    }
  ],
  statItems: [
    { label: "Years Experience", value: "5+" },
    { label: "Projects Completed", value: "50+" },
    { label: "Client Satisfaction", value: "100%" }
  ]
};

const skillsContent = {
  title: "Technical Skills",
  subtitle: "Areas of Expertise",
  description: "I have a broad range of technical skills across multiple technologies and frameworks.",
  categories: [
    {
      title: "Frontend Development",
      icon: "FaReact",
      iconBg: "bg-blue-500",
      iconColor: "text-white",
      titleColor: "text-blue-500",
      skills: [
        { name: "React.js", percentage: 95, colorClass: "bg-blue-500" },
        { name: "JavaScript (ES6+)", percentage: 90, colorClass: "bg-yellow-500" },
        { name: "HTML5 & CSS3", percentage: 95, colorClass: "bg-orange-500" },
        { name: "TypeScript", percentage: 85, colorClass: "bg-blue-400" }
      ]
    },
    {
      title: "Backend Development",
      icon: "FaNodeJs",
      iconBg: "bg-green-600",
      iconColor: "text-white",
      titleColor: "text-green-600",
      skills: [
        { name: "Node.js", percentage: 90, colorClass: "bg-green-600" },
        { name: "Express.js", percentage: 88, colorClass: "bg-gray-600" },
        { name: "REST APIs", percentage: 92, colorClass: "bg-purple-500" },
        { name: "SQL & NoSQL Databases", percentage: 85, colorClass: "bg-blue-600" }
      ]
    },
    {
      title: "DevOps & Tools",
      icon: "FaTools",
      iconBg: "bg-red-500",
      iconColor: "text-white",
      titleColor: "text-red-500",
      skills: [
        { name: "Git & Version Control", percentage: 90, colorClass: "bg-red-500" },
        { name: "AWS Services", percentage: 80, colorClass: "bg-yellow-600" },
        { name: "Docker", percentage: 75, colorClass: "bg-blue-500" },
        { name: "CI/CD Pipelines", percentage: 78, colorClass: "bg-green-500" }
      ]
    }
  ],
  technologies: [
    { name: "React", icon: "SiReact" },
    { name: "TypeScript", icon: "SiTypescript" },
    { name: "Node.js", icon: "SiNodedotjs" },
    { name: "Express", icon: "SiExpress" },
    { name: "MongoDB", icon: "SiMongodb" },
    { name: "PostgreSQL", icon: "SiPostgresql" },
    { name: "Redux", icon: "SiRedux" },
    { name: "Next.js", icon: "SiNextdotjs" },
    { name: "AWS", icon: "SiAmazonaws" },
    { name: "Docker", icon: "SiDocker" },
    { name: "Git", icon: "SiGit" }
  ]
};

const projectsContent = {
  title: "Featured Projects",
  subtitle: "My Recent Work",
  description: "Here are some of the projects I've worked on recently.",
  projects: [
    {
      title: "E-Commerce Platform",
      description: "A full-featured online store with product catalog, cart, and payment processing.",
      imagePlaceholder: "/project-1.svg",
      technologies: ["React", "Node.js", "Express", "MongoDB", "Stripe API"],
      githubLink: "https://github.com",
      liveLink: "https://project.com"
    },
    {
      title: "Real-time Chat Application",
      description: "A messaging platform with real-time updates, user authentication, and message history.",
      imagePlaceholder: "/project-2.svg",
      technologies: ["React", "Socket.io", "Express", "MongoDB", "JWT"],
      githubLink: "https://github.com",
      liveLink: "https://project.com"
    },
    {
      title: "Task Management Dashboard",
      description: "A productivity tool for teams to manage tasks, track progress, and collaborate efficiently.",
      imagePlaceholder: "/project-3.svg",
      technologies: ["React", "Redux", "Node.js", "PostgreSQL", "Chart.js"],
      githubLink: "https://github.com",
      liveLink: "https://project.com"
    },
    {
      title: "Fitness Tracking App",
      description: "A mobile-responsive application for tracking workouts, nutrition, and fitness goals.",
      imagePlaceholder: "/project-4.svg",
      technologies: ["React Native", "Firebase", "Redux", "Express", "OAuth"],
      githubLink: "https://github.com",
      liveLink: "https://project.com"
    }
  ]
};

const experienceContent = {
  title: "Professional Experience",
  subtitle: "My Journey",
  description: "A timeline of my professional experience and career journey.",
  experiences: [
    {
      title: "Senior Frontend Developer",
      company: "Tech Innovations Inc.",
      period: "Jan 2021 - Present",
      responsibilities: [
        "Lead developer for multiple client projects using React and TypeScript",
        "Implemented state management solutions using Redux and Context API",
        "Mentored junior developers and conducted code reviews",
        "Introduced performance optimizations reducing load times by 40%"
      ]
    },
    {
      title: "Full-Stack Developer",
      company: "WebSolutions Agency",
      period: "Mar 2018 - Dec 2020",
      responsibilities: [
        "Developed full-stack applications using MERN stack",
        "Created RESTful APIs and implemented authentication systems",
        "Collaborated with design team to implement responsive UI components",
        "Deployed and maintained applications on AWS"
      ]
    },
    {
      title: "Web Developer",
      company: "Digital Creations",
      period: "Jun 2016 - Feb 2018",
      responsibilities: [
        "Built and maintained client websites using JavaScript and PHP",
        "Implemented responsive designs using HTML5, CSS3, and Bootstrap",
        "Optimized website performance and SEO",
        "Provided technical support and bug fixes for existing projects"
      ]
    }
  ]
};

const contactContent = {
  title: "Get In Touch",
  subtitle: "Contact Me",
  description: "Feel free to reach out to me for collaboration, opportunities, or just to say hello!",
  email: "mark.remetio@example.com",
  socialLinks: [
    { name: "GitHub", url: "https://github.com", icon: "FaGithub" },
    { name: "LinkedIn", url: "https://linkedin.com", icon: "FaLinkedin" },
    { name: "Twitter", url: "https://twitter.com", icon: "FaTwitter" }
  ],
  formLabels: {
    name: "Your Name",
    email: "Your Email",
    subject: "Subject",
    message: "Your Message",
    button: "Send Message"
  }
};

// Helper functions for API calls
export const getHeroContent = () => heroContent;
export const getAboutContent = () => aboutContent;
export const getSkillsContent = () => skillsContent;
export const getProjectsContent = () => projectsContent;
export const getExperienceContent = () => experienceContent;
export const getContactContent = () => contactContent;

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