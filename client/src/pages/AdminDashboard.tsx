import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import "@/admin.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Save, 
  LogOut, 
  Plus, 
  Trash, 
  Code,
  Edit,
  X,
  Briefcase,
  Wrench,
  Star,
  Layers,
  User,
  Image as ImageIcon,
  Mail,
  ArrowUp,
  ArrowDown,
  Sparkles
} from "lucide-react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ImageUpload, MultipleImageUpload } from "@/components/ImageUpload";

// Define some interfaces for strongly-typed content
interface HeroContent {
  greeting: string;
  name: string;
  title: string;
  shortDescription: string;
  ctaButtons: Array<{
    text: string;
    link: string;
    primary: boolean;
    icon: string;
    downloadAction?: boolean;
  }>;
  stats: Array<{
    value: string;
    label: string;
    icon: string;
  }>;
  badges: Array<{
    text: string;
    bgColor: string;
    textColor: string;
    darkBgColor: string;
    darkTextColor: string;
  }>;
  profilePicture?: string;
}

interface AboutContent {
  title: string;
  subtitle?: string;
  description: string[];
  profilePicture?: string;
  imageAlt?: string;
  statItems?: Array<{
    label: string;
    value: string;
  }>;
  experience?: string;
  features?: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
}

interface ExperienceContent {
  title: string;
  subtitle: string;
  description: string;
  experiences: Array<{
    title: string;
    company: string;
    period: string;
    responsibilities: string[];
  }>;
}

interface SkillItem {
  name: string;
  percentage: number;
  colorClass: string;
}

interface SkillCategory {
  title: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  titleColor: string;
  skills: SkillItem[];
}

interface Technology {
  name: string;
  icon: string;
}

interface SkillsContent {
  title: string;
  subtitle: string;
  description: string;
  categories: SkillCategory[];
  technologies: Technology[];
}

interface ProjectItem {
  title: string;
  description: string;
  imagePlaceholder: string;
  technologies: string[];
  githubLink?: string;
  liveLink?: string;
}

interface ProjectsContent {
  title: string;
  subtitle: string;
  description: string;
  projects: ProjectItem[];
}

interface GalleryContent {
  title: string;
  subtitle: string;
  description: string;
  images: string[];
}

interface ContactContent {
  title: string;
  subtitle: string;
  description: string;
  email: string;
  socialLinks: Array<{
    name: string;
    url: string;
    icon: string;
  }>;
  formLabels: {
    name: string;
    email: string;
    subject: string;
    message: string;
    button: string;
  };
}

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sections, setSections] = useState<string[]>([]);
  const [currentSection, setCurrentSection] = useState<string>("");
  const [contentData, setContentData] = useState<any>(null);
  const [editedContent, setEditedContent] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [editMode, setEditMode] = useState<"form" | "json">("form");
  const [sectionLoading, setSectionLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Warn before leaving/reloading with unsaved edits.
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/status', {
          credentials: "include",
        });
        const data = await response.json();
        
        setIsAuthenticated(data.isAuthenticated);
        
        if (!data.isAuthenticated) {
          setLocation('/maglogin');
        } else {
          // Load content sections
          fetchSections();
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setLocation('/maglogin');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [setLocation]);

  // Fetch content sections
  const fetchSections = async () => {
    try {
      const response = await fetch('/api/content', {
        credentials: "include",
      });
      const data = await response.json();
      
      if (data.sections && data.sections.length > 0) {
        setSections(data.sections);
        setCurrentSection(data.sections[0]);
        fetchContent(data.sections[0]);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      toast({
        title: "Error",
        description: "Failed to fetch content sections",
        variant: "destructive",
      });
    }
  };

  // Fetch content for a specific section
  const fetchContent = async (section: string) => {
    setSectionLoading(true);
    try {
    const response = await fetch(`/api/content/${section}`, {
      credentials: "include",
    });
      const data = await response.json();

      setContentData(data);
      setEditedContent(JSON.stringify(data, null, 2));
      setIsDirty(false);
    } catch (error) {
      console.error(`Error fetching ${section} content:`, error);
      toast({
        title: "Error",
        description: `Failed to fetch ${section} content`,
        variant: "destructive",
      });
    } finally {
      setSectionLoading(false);
    }
  };

  // Handle section change — guard against silently discarding unsaved edits.
  const handleSectionChange = (section: string) => {
    if (section === currentSection) return;
    if (
      isDirty &&
      !window.confirm(
        "You have unsaved changes in this section. Discard them and switch?",
      )
    ) {
      return;
    }
    setCurrentSection(section);
    fetchContent(section);
  };

  // Handle content update (JSON mode)
  const handleJsonContentUpdate = async () => {
    setIsSaving(true);
    try {
      // Parse the content to validate JSON
      const contentToSave = JSON.parse(editedContent);
      
      const response = await fetch(`/api/content/${currentSection}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify(contentToSave),
      });

      if (response.status === 401) {
        toast({ title: "Session expired", description: "Please sign in again.", variant: "destructive" });
        setLocation("/maglogin");
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Saved",
          description: `${currentSection} content updated successfully`,
        });
        setIsDirty(false);
        // Refresh the content
        fetchContent(currentSection);
      } else {
        toast({
          title: "Error",
          description: data.message || `Failed to update ${currentSection} content`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating content:', error);
      if (error instanceof SyntaxError) {
        toast({
          title: "Invalid JSON",
          description: "Please check your JSON syntax and try again",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update content",
          variant: "destructive",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handle form content update
  const handleFormContentUpdate = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/content/${currentSection}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify(contentData),
      });

      if (response.status === 401) {
        toast({ title: "Session expired", description: "Please sign in again.", variant: "destructive" });
        setLocation("/maglogin");
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Saved",
          description: `${currentSection} content updated successfully`,
        });
        setIsDirty(false);
        // Update the JSON editor content too
        setEditedContent(JSON.stringify(contentData, null, 2));
      } else {
        toast({
          title: "Error",
          description: data.message || `Failed to update ${currentSection} content`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating content:', error);
      toast({
        title: "Error",
        description: "Failed to update content",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: "include",
      });
      setLocation('/maglogin');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Update a specific field in the content data
  const updateContentField = (path: string[], value: any) => {
    setIsDirty(true);
    setContentData((prevData: any) => {
      const newData = JSON.parse(JSON.stringify(prevData));
      let current = newData;
      
      // Navigate to the parent object
      for (let i = 0; i < path.length - 1; i++) {
        if (Array.isArray(current)) {
          current = current[parseInt(path[i])];
        } else {
          current = current[path[i]];
        }
      }
      
      // Set the value
      const lastKey = path[path.length - 1];
      if (Array.isArray(current)) {
        current[parseInt(lastKey)] = value;
      } else {
        current[lastKey] = value;
      }
      
      return newData;
    });
  };

  // Add an item to an array in the content data
  const addArrayItem = (path: string[], template: any) => {
    setIsDirty(true);
    setContentData((prevData: any) => {
      const newData = JSON.parse(JSON.stringify(prevData));
      let current = newData;
      
      // Navigate to the array
      for (let i = 0; i < path.length; i++) {
        if (Array.isArray(current)) {
          current = current[parseInt(path[i])];
        } else {
          current = current[path[i]];
        }
      }
      
      // Add the item
      if (Array.isArray(current)) {
        current.push(template);
      }
      
      return newData;
    });
  };

  // Remove an item from an array in the content data (with confirmation)
  const removeArrayItem = (path: string[], index: number) => {
    if (
      !window.confirm(
        "Remove this item? The change takes effect when you click Save.",
      )
    ) {
      return;
    }
    setIsDirty(true);
    setContentData((prevData: any) => {
      const newData = JSON.parse(JSON.stringify(prevData));
      let current = newData;

      // Navigate to the array
      for (let i = 0; i < path.length; i++) {
        if (Array.isArray(current)) {
          current = current[parseInt(path[i])];
        } else {
          current = current[path[i]];
        }
      }

      // Remove the item
      if (Array.isArray(current)) {
        current.splice(index, 1);
      }

      return newData;
    });
  };

  // Move an array item up (dir=-1) or down (dir=1); marks the section dirty.
  const moveArrayItem = (path: string[], index: number, dir: -1 | 1) => {
    setContentData((prevData: any) => {
      const newData = JSON.parse(JSON.stringify(prevData));
      let current = newData;
      for (let i = 0; i < path.length; i++) {
        current = Array.isArray(current)
          ? current[parseInt(path[i])]
          : current[path[i]];
      }
      if (!Array.isArray(current)) return prevData;
      const target = index + dir;
      if (target < 0 || target >= current.length) return prevData;
      [current[index], current[target]] = [current[target], current[index]];
      return newData;
    });
    setIsDirty(true);
  };

  // Small reusable reorder/remove toolbar for array item headers.
  const ItemToolbar = ({
    path,
    index,
    count,
    onRemove,
    label = "item",
  }: {
    path: string[];
    index: number;
    count: number;
    onRemove?: () => void;
    label?: string;
  }) => (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        className="admin-iconbtn"
        aria-label={`Move ${label} up`}
        disabled={index === 0}
        onClick={() => moveArrayItem(path, index, -1)}
      >
        <ArrowUp className="h-4 w-4" />
      </button>
      <button
        type="button"
        className="admin-iconbtn"
        aria-label={`Move ${label} down`}
        disabled={index === count - 1}
        onClick={() => moveArrayItem(path, index, 1)}
      >
        <ArrowDown className="h-4 w-4" />
      </button>
      <button
        type="button"
        className="admin-iconbtn danger"
        aria-label={`Remove ${label}`}
        onClick={onRemove ?? (() => removeArrayItem(path, index))}
      >
        <Trash className="h-4 w-4" />
      </button>
    </div>
  );

  // Section-specific form components
  const renderExperienceForm = () => {
    const data = contentData as ExperienceContent;
    
    if (!data || !data.experiences) {
      return <p>Loading experience data...</p>;
    }
    
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Section Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={data.title} 
                onChange={(e) => updateContentField(['title'], e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input 
                id="subtitle" 
                value={data.subtitle} 
                onChange={(e) => updateContentField(['subtitle'], e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={data.description} 
              onChange={(e) => updateContentField(['description'], e.target.value)}
            />
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Experience Items</h3>
            <Button 
              size="sm" 
              onClick={() => addArrayItem(['experiences'], {
                title: "New Position",
                company: "Company Name",
                period: "Start - End",
                responsibilities: ["Add your responsibilities here"]
              })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Experience
            </Button>
          </div>
          
          <Accordion type="multiple" className="w-full">
            {data.experiences.map((exp, expIndex) => (
              <AccordionItem key={expIndex} value={`exp-${expIndex}`}>
                <div className="flex items-center">
                  <AccordionTrigger className="flex-1">
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-2" />
                      <span>{exp.title} at {exp.company}</span>
                    </div>
                  </AccordionTrigger>
                  <div className="mr-4" onClick={(e) => e.stopPropagation()}>
                    <ItemToolbar
                      path={['experiences']}
                      index={expIndex}
                      count={data.experiences.length}
                      label="experience"
                    />
                  </div>
                </div>
                <AccordionContent>
                  <div className="space-y-4 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`exp-${expIndex}-title`}>Job Title</Label>
                        <Input 
                          id={`exp-${expIndex}-title`} 
                          value={exp.title} 
                          onChange={(e) => updateContentField(['experiences', expIndex.toString(), 'title'], e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`exp-${expIndex}-company`}>Company</Label>
                        <Input 
                          id={`exp-${expIndex}-company`} 
                          value={exp.company} 
                          onChange={(e) => updateContentField(['experiences', expIndex.toString(), 'company'], e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`exp-${expIndex}-period`}>Period</Label>
                      <Input 
                        id={`exp-${expIndex}-period`} 
                        value={exp.period} 
                        onChange={(e) => updateContentField(['experiences', expIndex.toString(), 'period'], e.target.value)}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label>Responsibilities</Label>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            const newResponsibilities = [...exp.responsibilities, "New responsibility"];
                            updateContentField(['experiences', expIndex.toString(), 'responsibilities'], newResponsibilities);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {exp.responsibilities.map((resp, respIndex) => (
                          <div key={respIndex} className="flex gap-2">
                            <Input 
                              value={resp} 
                              onChange={(e) => {
                                const newResponsibilities = [...exp.responsibilities];
                                newResponsibilities[respIndex] = e.target.value;
                                updateContentField(['experiences', expIndex.toString(), 'responsibilities'], newResponsibilities);
                              }}
                            />
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="shrink-0"
                              onClick={() => {
                                const newResponsibilities = [...exp.responsibilities];
                                newResponsibilities.splice(respIndex, 1);
                                updateContentField(['experiences', expIndex.toString(), 'responsibilities'], newResponsibilities);
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    );
  };

  const renderSkillsForm = () => {
    const data = contentData as SkillsContent;
    
    if (!data || !data.categories || !data.technologies) {
      return <p>Loading skills data...</p>;
    }
    
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Section Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={data.title} 
                onChange={(e) => updateContentField(['title'], e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input 
                id="subtitle" 
                value={data.subtitle} 
                onChange={(e) => updateContentField(['subtitle'], e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={data.description} 
              onChange={(e) => updateContentField(['description'], e.target.value)}
              rows={3}
            />
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Skill Categories</h3>
            <Button 
              size="sm" 
              onClick={() => addArrayItem(['categories'], {
                title: "New Category",
                icon: "FaCode",
                iconBg: "bg-indigo-600",
                iconColor: "text-white",
                titleColor: "text-indigo-600",
                skills: [
                  { name: "New Skill", percentage: 80, colorClass: "text-indigo-600" }
                ]
              })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>
          
          <Accordion type="multiple" className="w-full">
            {data.categories.map((category, catIndex) => (
              <AccordionItem key={catIndex} value={`cat-${catIndex}`}>
                <div className="flex items-center">
                  <AccordionTrigger className="flex-1">
                    <div className="flex items-center">
                      <div className={`${category.iconBg} p-1 rounded mr-2 flex items-center justify-center`}>
                        <span className={`${category.iconColor} text-xs`}>Icon</span>
                      </div>
                      <span>{category.title}</span>
                    </div>
                  </AccordionTrigger>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    className="mr-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeArrayItem(['categories'], catIndex);
                    }}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
                <AccordionContent>
                  <div className="space-y-6 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`cat-${catIndex}-title`}>Category Title</Label>
                        <Input 
                          id={`cat-${catIndex}-title`} 
                          value={category.title} 
                          onChange={(e) => updateContentField(['categories', catIndex.toString(), 'title'], e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`cat-${catIndex}-icon`}>Icon Name</Label>
                        <Input 
                          id={`cat-${catIndex}-icon`} 
                          value={category.icon} 
                          onChange={(e) => updateContentField(['categories', catIndex.toString(), 'icon'], e.target.value)}
                        />
                        <p className="text-xs admin-muted mt-1">
                          Use icon names from react-icons (e.g., FaReact, FaNodeJs, FaTools)
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`cat-${catIndex}-iconBg`}>Icon Background</Label>
                        <Input 
                          id={`cat-${catIndex}-iconBg`} 
                          value={category.iconBg} 
                          onChange={(e) => updateContentField(['categories', catIndex.toString(), 'iconBg'], e.target.value)}
                        />
                        <p className="text-xs admin-muted mt-1">
                          Tailwind class (e.g., bg-indigo-600)
                        </p>
                      </div>
                      <div>
                        <Label htmlFor={`cat-${catIndex}-iconColor`}>Icon Color</Label>
                        <Input 
                          id={`cat-${catIndex}-iconColor`} 
                          value={category.iconColor} 
                          onChange={(e) => updateContentField(['categories', catIndex.toString(), 'iconColor'], e.target.value)}
                        />
                        <p className="text-xs admin-muted mt-1">
                          Tailwind class (e.g., text-white)
                        </p>
                      </div>
                      <div>
                        <Label htmlFor={`cat-${catIndex}-titleColor`}>Title Color</Label>
                        <Input 
                          id={`cat-${catIndex}-titleColor`} 
                          value={category.titleColor} 
                          onChange={(e) => updateContentField(['categories', catIndex.toString(), 'titleColor'], e.target.value)}
                        />
                        <p className="text-xs admin-muted mt-1">
                          Tailwind class (e.g., text-indigo-600)
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <Label>Skills</Label>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            const newSkills = [...category.skills, {
                              name: "New Skill", 
                              percentage: 80,
                              colorClass: "text-indigo-600"
                            }];
                            updateContentField(['categories', catIndex.toString(), 'skills'], newSkills);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Skill
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        {category.skills.map((skill, skillIndex) => (
                          <div key={skillIndex} className="admin-item p-4 rounded-md">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium">{skill.name}</h4>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  const newSkills = [...category.skills];
                                  newSkills.splice(skillIndex, 1);
                                  updateContentField(['categories', catIndex.toString(), 'skills'], newSkills);
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`skill-${catIndex}-${skillIndex}-name`}>Skill Name</Label>
                                <Input 
                                  id={`skill-${catIndex}-${skillIndex}-name`} 
                                  value={skill.name} 
                                  onChange={(e) => {
                                    const newSkills = [...category.skills];
                                    newSkills[skillIndex].name = e.target.value;
                                    updateContentField(['categories', catIndex.toString(), 'skills'], newSkills);
                                  }}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`skill-${catIndex}-${skillIndex}-percentage`}>Percentage (0-100)</Label>
                                <Input 
                                  id={`skill-${catIndex}-${skillIndex}-percentage`} 
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={skill.percentage} 
                                  onChange={(e) => {
                                    const parsed = parseInt(e.target.value, 10);
                                    const pct = Number.isNaN(parsed) ? 0 : Math.max(0, Math.min(100, parsed));
                                    const newSkills = [...category.skills];
                                    newSkills[skillIndex].percentage = pct;
                                    updateContentField(['categories', catIndex.toString(), 'skills'], newSkills);
                                  }}
                                />
                              </div>
                              <div className="md:col-span-2">
                                <Label htmlFor={`skill-${catIndex}-${skillIndex}-colorClass`}>Color Class</Label>
                                <Input 
                                  id={`skill-${catIndex}-${skillIndex}-colorClass`} 
                                  value={skill.colorClass} 
                                  onChange={(e) => {
                                    const newSkills = [...category.skills];
                                    newSkills[skillIndex].colorClass = e.target.value;
                                    updateContentField(['categories', catIndex.toString(), 'skills'], newSkills);
                                  }}
                                />
                                <p className="text-xs admin-muted mt-1">
                                  Tailwind class (e.g., text-indigo-600)
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Technologies Carousel</h3>
            <Button 
              size="sm" 
              onClick={() => addArrayItem(['technologies'], {
                name: "New Technology",
                icon: "SiReact"
              })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Technology
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.technologies.map((tech, techIndex) => (
              <div key={techIndex} className="admin-item p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 admin-muted text-xs">
                    <Wrench className="w-3.5 h-3.5" /> Technology {techIndex + 1}
                  </div>
                  <button
                    type="button"
                    className="admin-iconbtn danger"
                    aria-label="Remove technology"
                    onClick={() => removeArrayItem(['technologies'], techIndex)}
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  <input
                    aria-label="Technology name"
                    placeholder="React"
                    value={tech.name}
                    onChange={(e) => {
                      const newTechnologies = [...data.technologies];
                      newTechnologies[techIndex] = { ...tech, name: e.target.value };
                      updateContentField(['technologies'], newTechnologies);
                    }}
                  />
                  <input
                    aria-label="Technology icon"
                    placeholder="SiReact"
                    className="admin-mono"
                    value={tech.icon}
                    onChange={(e) => {
                      const newTechnologies = [...data.technologies];
                      newTechnologies[techIndex] = { ...tech, icon: e.target.value };
                      updateContentField(['technologies'], newTechnologies);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderHeroForm = () => {
    const data = contentData as HeroContent;
    
    if (!data) {
      return <p>Loading hero section data...</p>;
    }
    
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Basic Information</h3>
          <div>
            <Label htmlFor="greeting">Greeting</Label>
            <Input 
              id="greeting" 
              value={data.greeting} 
              onChange={(e) => updateContentField(['greeting'], e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={data.name} 
                onChange={(e) => updateContentField(['name'], e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={data.title} 
                onChange={(e) => updateContentField(['title'], e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="shortDescription">Description</Label>
            <Textarea 
              id="shortDescription" 
              value={data.shortDescription} 
              onChange={(e) => updateContentField(['shortDescription'], e.target.value)}
            />
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">CTA Buttons</h3>
            <Button 
              size="sm" 
              onClick={() => addArrayItem(['ctaButtons'], {
                text: "New Button",
                link: "#",
                primary: false,
                icon: "link"
              })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Button
            </Button>
          </div>
          
          {data.ctaButtons && data.ctaButtons.length > 0 ? (
            <div className="space-y-4">
              {data.ctaButtons.map((button, index) => (
                <div key={index} className="p-4 admin-item rounded-md">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Button {index + 1}</h4>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700"
                      onClick={() => removeArrayItem(['ctaButtons'], index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Button Text</Label>
                      <Input 
                        value={button.text} 
                        onChange={(e) => updateContentField(['ctaButtons', index.toString(), 'text'], e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Button Link</Label>
                      <Input 
                        value={button.link} 
                        onChange={(e) => updateContentField(['ctaButtons', index.toString(), 'link'], e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <Label>Icon</Label>
                      <Input 
                        value={button.icon} 
                        onChange={(e) => updateContentField(['ctaButtons', index.toString(), 'icon'], e.target.value)}
                      />
                    </div>
                    <div className="flex items-center pt-6">
                      <Switch 
                        id={`primary-switch-${index}`}
                        checked={button.primary}
                        onCheckedChange={(checked) => updateContentField(['ctaButtons', index.toString(), 'primary'], checked)}
                      />
                      <Label htmlFor={`primary-switch-${index}`} className="ml-2">Primary Button</Label>
                    </div>
                  </div>
                  
                  {index === 1 && (
                    <div className="flex items-center mt-3">
                      <Switch 
                        id={`download-switch-${index}`}
                        checked={button.downloadAction || false}
                        onCheckedChange={(checked) => updateContentField(['ctaButtons', index.toString(), 'downloadAction'], checked)}
                      />
                      <Label htmlFor={`download-switch-${index}`} className="ml-2">Is Resume Download Button</Label>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm admin-muted">No CTA buttons added yet. Add one above.</p>
          )}
        </div>
        
        <Separator />
        
        <div>
          <ImageUpload 
            label="Profile Picture (Optional)"
            currentImagePath={data.profilePicture} 
            onImageUploaded={(path) => updateContentField(['profilePicture'], path)}
          />
          <p className="text-xs admin-muted mt-1">
            Upload a profile picture that will be displayed in the hero section.
          </p>
        </div>
      </div>
    );
  };

  const renderAboutForm = () => {
    const data = contentData as AboutContent;
    
    if (!data) {
      return <p>Loading about section data...</p>;
    }
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              value={data.title} 
              onChange={(e) => updateContentField(['title'], e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="experience">Experience</Label>
            <Input 
              id="experience" 
              value={data.experience || ''} 
              onChange={(e) => updateContentField(['experience'], e.target.value)}
              placeholder="e.g. 5+ Years"
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label>Description Paragraphs</Label>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                const newDescription = [...(data.description || []), "New paragraph"];
                updateContentField(['description'], newDescription);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Paragraph
            </Button>
          </div>
          
          <div className="space-y-3">
            {data.description && data.description.map((paragraph, paragraphIndex) => (
              <div key={paragraphIndex} className="flex gap-2">
                <Textarea 
                  value={paragraph} 
                  onChange={(e) => {
                    const newDescription = [...data.description];
                    newDescription[paragraphIndex] = e.target.value;
                    updateContentField(['description'], newDescription);
                  }}
                />
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="shrink-0"
                  onClick={() => {
                    const newDescription = [...data.description];
                    newDescription.splice(paragraphIndex, 1);
                    updateContentField(['description'], newDescription);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
        
        {data.profilePicture !== undefined && (
          <div className="space-y-4">
            <ImageUpload 
              label="Profile Picture"
              currentImagePath={data.profilePicture} 
              onImageUploaded={(path) => updateContentField(['profilePicture'], path)}
            />
            {data.imageAlt !== undefined && (
              <div>
                <Label htmlFor="imageAlt">Image Alt Text</Label>
                <Input 
                  id="imageAlt" 
                  value={data.imageAlt} 
                  onChange={(e) => updateContentField(['imageAlt'], e.target.value)}
                />
              </div>
            )}
          </div>
        )}
        
        <Separator />
        
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Features</h3>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                const newFeatures = [...(data.features || []), {
                  title: "New Feature",
                  description: "Feature description",
                  icon: "code"
                }];
                updateContentField(['features'], newFeatures);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Feature
            </Button>
          </div>
          
          {data.features && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.features.map((feature, featureIndex) => (
                <div 
                  key={featureIndex}
                  className="admin-item p-4 rounded-md"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">{feature.title}</h4>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      onClick={() => {
                        const newFeatures = [...data.features!];
                        newFeatures.splice(featureIndex, 1);
                        updateContentField(['features'], newFeatures);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor={`feature-${featureIndex}-title`}>Title</Label>
                      <Input 
                        id={`feature-${featureIndex}-title`} 
                        value={feature.title} 
                        onChange={(e) => {
                          const newFeatures = [...data.features!];
                          newFeatures[featureIndex].title = e.target.value;
                          updateContentField(['features'], newFeatures);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`feature-${featureIndex}-description`}>Description</Label>
                      <Textarea 
                        id={`feature-${featureIndex}-description`} 
                        value={feature.description} 
                        onChange={(e) => {
                          const newFeatures = [...data.features!];
                          newFeatures[featureIndex].description = e.target.value;
                          updateContentField(['features'], newFeatures);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`feature-${featureIndex}-icon`}>Icon</Label>
                      <Input 
                        id={`feature-${featureIndex}-icon`} 
                        value={feature.icon}
                        placeholder="e.g. code, server, paint-brush, etc."
                        onChange={(e) => {
                          const newFeatures = [...data.features!];
                          newFeatures[featureIndex].icon = e.target.value;
                          updateContentField(['features'], newFeatures);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {data.statItems && (
          <>
            <Separator />
            
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Statistics Items</h3>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    const newStatItems = [...(data.statItems || []), {
                      label: "New Stat",
                      value: "0+"
                    }];
                    updateContentField(['statItems'], newStatItems);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stat
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.statItems.map((stat, statIndex) => (
                  <div 
                    key={statIndex}
                    className="admin-item p-4 rounded-md"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <Badge variant="secondary">{stat.value}</Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          const newStatItems = [...data.statItems!];
                          newStatItems.splice(statIndex, 1);
                          updateContentField(['statItems'], newStatItems);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <Label htmlFor={`stat-${statIndex}-label`} className="text-xs">Label</Label>
                        <Input 
                          id={`stat-${statIndex}-label`} 
                          value={stat.label} 
                          className="h-8 text-sm"
                          onChange={(e) => {
                            const newStatItems = [...data.statItems!];
                            newStatItems[statIndex].label = e.target.value;
                            updateContentField(['statItems'], newStatItems);
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`stat-${statIndex}-value`} className="text-xs">Value</Label>
                        <Input 
                          id={`stat-${statIndex}-value`} 
                          value={stat.value}
                          className="h-8 text-sm"
                          onChange={(e) => {
                            const newStatItems = [...data.statItems!];
                            newStatItems[statIndex].value = e.target.value;
                            updateContentField(['statItems'], newStatItems);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // Projects form
  const renderProjectsForm = () => {
    const data = contentData as ProjectsContent;
    
    if (!data || !data.projects) {
      return <p>Loading projects data...</p>;
    }
    
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Section Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={data.title} 
                onChange={(e) => updateContentField(['title'], e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input 
                id="subtitle" 
                value={data.subtitle} 
                onChange={(e) => updateContentField(['subtitle'], e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={data.description} 
              onChange={(e) => updateContentField(['description'], e.target.value)}
            />
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Projects</h3>
            <Button 
              size="sm" 
              onClick={() => addArrayItem(['projects'], {
                title: "New Project",
                description: "Project description goes here",
                imagePlaceholder: "",
                technologies: ["Tech 1", "Tech 2"],
                githubLink: "",
                liveLink: ""
              })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          </div>
          
          <Accordion type="multiple" className="w-full">
            {data.projects.map((project, projectIndex) => (
              <AccordionItem key={projectIndex} value={`project-${projectIndex}`}>
                <div className="flex items-center">
                  <AccordionTrigger className="flex-1">
                    <div className="flex items-center">
                      <Layers className="w-4 h-4 mr-2" />
                      <span>{project.title}</span>
                    </div>
                  </AccordionTrigger>
                  <div className="mr-4" onClick={(e) => e.stopPropagation()}>
                    <ItemToolbar
                      path={['projects']}
                      index={projectIndex}
                      count={data.projects.length}
                      label="project"
                    />
                  </div>
                </div>
                <AccordionContent>
                  <div className="space-y-4 p-4">
                    <div>
                      <Label htmlFor={`project-${projectIndex}-title`}>Project Title</Label>
                      <Input 
                        id={`project-${projectIndex}-title`} 
                        value={project.title} 
                        onChange={(e) => updateContentField(['projects', projectIndex.toString(), 'title'], e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`project-${projectIndex}-description`}>Description</Label>
                      <Textarea 
                        id={`project-${projectIndex}-description`} 
                        value={project.description} 
                        onChange={(e) => updateContentField(['projects', projectIndex.toString(), 'description'], e.target.value)}
                      />
                    </div>
                    
                    <ImageUpload 
                      label="Project Image"
                      currentImagePath={project.imagePlaceholder} 
                      onImageUploaded={(path) => updateContentField(['projects', projectIndex.toString(), 'imagePlaceholder'], path)}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`project-${projectIndex}-github`}>GitHub Link</Label>
                        <Input 
                          id={`project-${projectIndex}-github`} 
                          value={project.githubLink || ''} 
                          onChange={(e) => updateContentField(['projects', projectIndex.toString(), 'githubLink'], e.target.value)}
                          placeholder="https://github.com/username/repo"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`project-${projectIndex}-live`}>Live Demo Link</Label>
                        <Input 
                          id={`project-${projectIndex}-live`} 
                          value={project.liveLink || ''} 
                          onChange={(e) => updateContentField(['projects', projectIndex.toString(), 'liveLink'], e.target.value)}
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label>Technologies</Label>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            const newTechs = [...project.technologies, "New Technology"];
                            updateContentField(['projects', projectIndex.toString(), 'technologies'], newTechs);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Technology
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {project.technologies.map((tech, techIndex) => (
                          <div key={techIndex} className="flex gap-2">
                            <Input 
                              value={tech} 
                              onChange={(e) => {
                                const newTechs = [...project.technologies];
                                newTechs[techIndex] = e.target.value;
                                updateContentField(['projects', projectIndex.toString(), 'technologies'], newTechs);
                              }}
                            />
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="shrink-0"
                              onClick={() => {
                                const newTechs = [...project.technologies];
                                newTechs.splice(techIndex, 1);
                                updateContentField(['projects', projectIndex.toString(), 'technologies'], newTechs);
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    );
  };
  
  // Gallery form
  const renderGalleryForm = () => {
    const data = contentData as GalleryContent;
    
    if (!data || !data.images) {
      return <p>Loading gallery data...</p>;
    }
    
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Section Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={data.title} 
                onChange={(e) => updateContentField(['title'], e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input 
                id="subtitle" 
                value={data.subtitle} 
                onChange={(e) => updateContentField(['subtitle'], e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={data.description} 
              onChange={(e) => updateContentField(['description'], e.target.value)}
            />
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Gallery Images</h3>
          
          <MultipleImageUpload 
            label="Upload Multiple Images"
            onImagesUploaded={(paths) => {
              const newImages = [...data.images, ...paths];
              updateContentField(['images'], newImages);
            }}
          />
          
          <div className="mt-6">
            <h4 className="text-lg font-medium mb-3">Current Images</h4>
            {data.images.length === 0 ? (
              <p className="text-sm admin-muted">No images in the gallery yet. Upload some images above.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="relative aspect-square rounded-md overflow-hidden bg-[color:var(--panel-solid)] border border-[color:var(--line)]">
                      <img
                        src={image}
                        alt={`Gallery image ${index + 1}`}
                        className="object-cover w-full h-full"
                        loading="lazy"
                      />
                      <div
                        className="absolute inset-x-0 top-0 flex justify-between items-start p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: "linear-gradient(rgba(6,9,19,0.78), transparent)" }}
                      >
                        <div className="flex gap-1">
                          <button
                            type="button"
                            className="admin-iconbtn"
                            aria-label="Move image earlier"
                            disabled={index === 0}
                            onClick={() => moveArrayItem(["images"], index, -1)}
                          >
                            <ArrowUp className="h-4 w-4 -rotate-90" />
                          </button>
                          <button
                            type="button"
                            className="admin-iconbtn"
                            aria-label="Move image later"
                            disabled={index === data.images.length - 1}
                            onClick={() => moveArrayItem(["images"], index, 1)}
                          >
                            <ArrowDown className="h-4 w-4 -rotate-90" />
                          </button>
                        </div>
                        <button
                          type="button"
                          className="admin-iconbtn danger"
                          aria-label="Remove image"
                          onClick={() => {
                            if (!window.confirm("Remove this image? Applies when you Save.")) return;
                            const newImages = [...data.images];
                            newImages.splice(index, 1);
                            updateContentField(["images"], newImages);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <span
                        className="absolute bottom-1 left-1 admin-badge"
                        style={{ fontSize: 10, padding: "2px 7px" }}
                      >
                        {index + 1}
                      </span>
                    </div>
                    <div className="text-xs admin-muted mt-1 truncate">{image.split('/').pop()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Contact section form
  const renderContactForm = () => {
    const data = contentData as ContactContent;
    
    if (!data) {
      return <p>Loading contact data...</p>;
    }
    
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Section Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={data.title} 
                onChange={(e) => updateContentField(['title'], e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input 
                id="subtitle" 
                value={data.subtitle} 
                onChange={(e) => updateContentField(['subtitle'], e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={data.description} 
              onChange={(e) => updateContentField(['description'], e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              type="email"
              value={data.email} 
              onChange={(e) => updateContentField(['email'], e.target.value)}
            />
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Social Links</h3>
            <Button 
              size="sm" 
              onClick={() => addArrayItem(['socialLinks'], {
                name: "New Platform",
                url: "https://example.com",
                icon: "FaLink"
              })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Social Link
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {data.socialLinks && data.socialLinks.map((link, linkIndex) => (
              <Card key={linkIndex}>
                <CardHeader className="py-4 px-5">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">{link.name}</CardTitle>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => removeArrayItem(['socialLinks'], linkIndex)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="py-3 px-5 space-y-4">
                  <div>
                    <Label htmlFor={`social-${linkIndex}-name`}>Platform Name</Label>
                    <Input 
                      id={`social-${linkIndex}-name`} 
                      value={link.name}
                      onChange={(e) => {
                        const newSocialLinks = [...data.socialLinks];
                        newSocialLinks[linkIndex].name = e.target.value;
                        updateContentField(['socialLinks'], newSocialLinks);
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`social-${linkIndex}-url`}>URL</Label>
                    <Input 
                      id={`social-${linkIndex}-url`} 
                      value={link.url}
                      onChange={(e) => {
                        const newSocialLinks = [...data.socialLinks];
                        newSocialLinks[linkIndex].url = e.target.value;
                        updateContentField(['socialLinks'], newSocialLinks);
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`social-${linkIndex}-icon`}>Icon (from React Icons)</Label>
                    <Input 
                      id={`social-${linkIndex}-icon`} 
                      value={link.icon}
                      placeholder="e.g. FaGithub, FaLinkedin, FaTwitter"
                      onChange={(e) => {
                        const newSocialLinks = [...data.socialLinks];
                        newSocialLinks[linkIndex].icon = e.target.value;
                        updateContentField(['socialLinks'], newSocialLinks);
                      }}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter React Icons component name (FaGithub, FaLinkedin, etc.)
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Form Labels</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="form-name-label">Name Field Label</Label>
              <Input 
                id="form-name-label" 
                value={data.formLabels.name} 
                onChange={(e) => updateContentField(['formLabels', 'name'], e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="form-email-label">Email Field Label</Label>
              <Input 
                id="form-email-label" 
                value={data.formLabels.email} 
                onChange={(e) => updateContentField(['formLabels', 'email'], e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="form-subject-label">Subject Field Label</Label>
              <Input 
                id="form-subject-label" 
                value={data.formLabels.subject} 
                onChange={(e) => updateContentField(['formLabels', 'subject'], e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="form-message-label">Message Field Label</Label>
              <Input 
                id="form-message-label" 
                value={data.formLabels.message} 
                onChange={(e) => updateContentField(['formLabels', 'message'], e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="form-button-label">Submit Button Label</Label>
              <Input 
                id="form-button-label" 
                value={data.formLabels.button} 
                onChange={(e) => updateContentField(['formLabels', 'button'], e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render the appropriate form based on section
  const renderCredentialsForm = () => {
    const data = contentData as any;
    if (!data) return <p className="admin-muted">Loading credentials…</p>;
    const flow: any[] = data.aiWorkflow || [];
    const achievements: any[] = data.achievements || [];
    const certs: any[] = data.certifications || [];
    const sub = (path: string[], value: any) => updateContentField(path, value);

    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold" style={{ color: "var(--ink)" }}>Section Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Eyebrow</Label>
              <Input value={data.subtitle || ""} onChange={(e) => sub(["subtitle"], e.target.value)} placeholder="// ai-practice.md" />
            </div>
            <div>
              <Label>Title</Label>
              <Input value={data.title || ""} onChange={(e) => sub(["title"], e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={data.description || ""} onChange={(e) => sub(["description"], e.target.value)} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold" style={{ color: "var(--ink)" }}>AI Workflow Steps</h3>
            <button className="admin-btn admin-btn-ghost" onClick={() => addArrayItem(["aiWorkflow"], { icon: "sparkles", title: "", description: "" })}>
              <Plus className="w-4 h-4" /> Add step
            </button>
          </div>
          {flow.map((s, i) => (
            <div className="admin-item" key={i}>
              <div className="flex items-center justify-between mb-3">
                <span className="admin-muted text-xs">Step {i + 1}</span>
                <ItemToolbar path={["aiWorkflow"]} index={i} count={flow.length} label="step" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label>Icon</Label>
                  <Input value={s.icon || ""} onChange={(e) => sub(["aiWorkflow", i.toString(), "icon"], e.target.value)} placeholder="rocket" />
                </div>
                <div className="md:col-span-2">
                  <Label>Title</Label>
                  <Input value={s.title || ""} onChange={(e) => sub(["aiWorkflow", i.toString(), "title"], e.target.value)} />
                </div>
              </div>
              <div className="mt-3">
                <Label>Description</Label>
                <Textarea value={s.description || ""} onChange={(e) => sub(["aiWorkflow", i.toString(), "description"], e.target.value)} />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold" style={{ color: "var(--ink)" }}>Achievements</h3>
            <button className="admin-btn admin-btn-ghost" onClick={() => addArrayItem(["achievements"], { icon: "trophy", title: "", description: "" })}>
              <Plus className="w-4 h-4" /> Add achievement
            </button>
          </div>
          {achievements.map((a, i) => (
            <div className="admin-item" key={i}>
              <div className="flex items-center justify-between mb-3">
                <span className="admin-muted text-xs">Achievement {i + 1}</span>
                <ItemToolbar path={["achievements"]} index={i} count={achievements.length} label="achievement" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label>Icon</Label>
                  <Input value={a.icon || ""} onChange={(e) => sub(["achievements", i.toString(), "icon"], e.target.value)} placeholder="trophy" />
                </div>
                <div className="md:col-span-2">
                  <Label>Title</Label>
                  <Input value={a.title || ""} onChange={(e) => sub(["achievements", i.toString(), "title"], e.target.value)} />
                </div>
              </div>
              <div className="mt-3">
                <Label>Description</Label>
                <Textarea value={a.description || ""} onChange={(e) => sub(["achievements", i.toString(), "description"], e.target.value)} />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold" style={{ color: "var(--ink)" }}>Certifications</h3>
            <button className="admin-btn admin-btn-ghost" onClick={() => addArrayItem(["certifications"], { name: "", issuer: "", year: "", credentialId: "", skills: "" })}>
              <Plus className="w-4 h-4" /> Add certification
            </button>
          </div>
          {certs.map((c, i) => (
            <div className="admin-item" key={i}>
              <div className="flex items-center justify-between mb-3">
                <span className="admin-muted text-xs">Certification {i + 1}</span>
                <ItemToolbar path={["certifications"]} index={i} count={certs.length} label="certification" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Name</Label>
                  <Input value={c.name || ""} onChange={(e) => sub(["certifications", i.toString(), "name"], e.target.value)} />
                </div>
                <div>
                  <Label>Issuer</Label>
                  <Input value={c.issuer || ""} onChange={(e) => sub(["certifications", i.toString(), "issuer"], e.target.value)} />
                </div>
                <div>
                  <Label>Year</Label>
                  <Input value={c.year || ""} onChange={(e) => sub(["certifications", i.toString(), "year"], e.target.value)} placeholder="2026" />
                </div>
                <div>
                  <Label>Credential ID</Label>
                  <Input value={c.credentialId || ""} onChange={(e) => sub(["certifications", i.toString(), "credentialId"], e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <Label>Skills</Label>
                  <Input value={c.skills || ""} onChange={(e) => sub(["certifications", i.toString(), "skills"], e.target.value)} placeholder="Generative AI · Software Development" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSectionForm = () => {
    switch (currentSection) {
      case 'hero':
        return renderHeroForm();
      case 'about':
        return renderAboutForm();
      case 'credentials':
        return renderCredentialsForm();
      case 'skills':
        return renderSkillsForm();
      case 'projects':
        return renderProjectsForm();
      case 'gallery':
        return renderGalleryForm();
      case 'contact':
        return renderContactForm();
      default:
        return (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800">
              Form editor not available for this section. Use the JSON editor instead.
            </p>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="admin-page flex items-center justify-center min-h-screen">
        <Loader2 className="w-7 h-7 animate-spin" style={{ color: "var(--cyan)" }} />
        <span className="ml-3 admin-muted">Loading console…</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirect handled in useEffect
  }

  // Get section icon
  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'hero':
        return <Star className="w-4 h-4 mr-2" />;
      case 'about':
        return <User className="w-4 h-4 mr-2" />;
      case 'credentials':
        return <Sparkles className="w-4 h-4 mr-2" />;
      case 'skills':
        return <Wrench className="w-4 h-4 mr-2" />;
      case 'projects':
        return <Layers className="w-4 h-4 mr-2" />;
      case 'gallery':
        return <ImageIcon className="w-4 h-4 mr-2" />;
      case 'contact':
        return <Mail className="w-4 h-4 mr-2" />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-page min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
          <div className="admin-brand">
            <span className="admin-brand-mark">&lt;/&gt;</span>
            <div className="leading-tight">
              <h1 className="admin-h1 text-2xl">
                Content <span className="admin-grad">Studio</span>
              </h1>
              <div className="admin-eyebrow">// portfolio.cms</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isDirty && (
              <span className="admin-badge" title="You have unsaved changes">
                <span className="admin-dirty-dot" /> Unsaved changes
              </span>
            )}
            <button className="admin-btn admin-btn-ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <div className="admin-card p-4 md:sticky md:top-8">
              <div className="admin-eyebrow mb-3 px-1">Sections</div>
              <nav className="space-y-1.5" aria-label="Content sections">
                {sections.map((section) => (
                  <button
                    key={section}
                    className={`admin-nav-item ${section === currentSection ? "active" : ""}`}
                    aria-current={section === currentSection ? "true" : undefined}
                    onClick={() => handleSectionChange(section)}
                  >
                    {getSectionIcon(section)}
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content Editor */}
          <section className="md:col-span-3">
            <div className="admin-card p-5 md:p-7">
              <div className="flex flex-wrap gap-3 justify-between items-center mb-2">
                <h2 className="admin-h1 text-lg flex items-center gap-2">
                  Editing:{" "}
                  <span className="admin-grad">
                    {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}
                  </span>
                  {sectionLoading && (
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: "var(--muted)" }} />
                  )}
                </h2>
                <div className="flex gap-2">
                  <button
                    className={`admin-btn ${editMode === "form" ? "admin-btn-primary" : "admin-btn-ghost"}`}
                    onClick={() => setEditMode("form")}
                  >
                    <Edit className="w-4 h-4" /> Form
                  </button>
                  <button
                    className={`admin-btn ${editMode === "json" ? "admin-btn-primary" : "admin-btn-ghost"}`}
                    onClick={() => setEditMode("json")}
                  >
                    <Code className="w-4 h-4" /> JSON
                  </button>
                </div>
              </div>
              <p className="admin-muted text-sm mb-5">
                {editMode === "form"
                  ? "Edit the content with the form below, then Save."
                  : "Edit raw JSON. Keep it valid — invalid structure can break the public page."}
              </p>

              <div className={sectionLoading ? "opacity-60 pointer-events-none" : ""}>
                {editMode === "form" ? (
                  <div className="space-y-6">
                    {renderSectionForm()}
                    <hr className="admin-divider" />
                    <button
                      className="admin-btn admin-btn-primary w-full"
                      onClick={handleFormContentUpdate}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" /> Save Changes
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="editor" className="admin-label">JSON content</label>
                      <textarea
                        id="editor"
                        className="admin-mono h-[500px]"
                        style={{ fontSize: 13, lineHeight: 1.55 }}
                        value={editedContent}
                        onChange={(e) => {
                          setEditedContent(e.target.value);
                          setIsDirty(true);
                        }}
                      />
                    </div>
                    <button
                      className="admin-btn admin-btn-primary w-full"
                      onClick={handleJsonContentUpdate}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" /> Save JSON Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
