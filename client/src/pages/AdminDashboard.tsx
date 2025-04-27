import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Image as ImageIcon
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

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sections, setSections] = useState<string[]>([]);
  const [currentSection, setCurrentSection] = useState<string>("");
  const [contentData, setContentData] = useState<any>(null);
  const [editedContent, setEditedContent] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [editMode, setEditMode] = useState<"form" | "json">("form");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/status');
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
      const response = await fetch('/api/content');
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
    setIsLoading(true);
    try {
      const response = await fetch(`/api/content/${section}`);
      const data = await response.json();
      
      setContentData(data);
      setEditedContent(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error fetching ${section} content:`, error);
      toast({
        title: "Error",
        description: `Failed to fetch ${section} content`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle section change
  const handleSectionChange = (section: string) => {
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
        body: JSON.stringify(contentToSave),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({
          title: "Success",
          description: `${currentSection} content updated successfully`,
        });
        
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
        body: JSON.stringify(contentData),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({
          title: "Success",
          description: `${currentSection} content updated successfully`,
        });
        
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
      await fetch('/api/admin/logout', { method: 'POST' });
      setLocation('/maglogin');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Update a specific field in the content data
  const updateContentField = (path: string[], value: any) => {
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

  // Remove an item from an array in the content data
  const removeArrayItem = (path: string[], index: number) => {
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
                  <Button 
                    variant="destructive" 
                    size="sm"
                    className="mr-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeArrayItem(['experiences'], expIndex);
                    }}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
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
                        <p className="text-xs text-gray-500 mt-1">
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
                        <p className="text-xs text-gray-500 mt-1">
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
                        <p className="text-xs text-gray-500 mt-1">
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
                        <p className="text-xs text-gray-500 mt-1">
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
                          <div key={skillIndex} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
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
                                    const newSkills = [...category.skills];
                                    newSkills[skillIndex].percentage = parseInt(e.target.value);
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
                                <p className="text-xs text-gray-500 mt-1">
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
              <div 
                key={techIndex}
                className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4" />
                    <span className="font-medium">{tech.name}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Icon: {tech.icon}</div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      const updatedTech = {...tech};
                      const name = prompt("Enter technology name:", tech.name);
                      if (name) updatedTech.name = name;
                      const icon = prompt("Enter icon name (e.g., SiReact):", tech.icon);
                      if (icon) updatedTech.icon = icon;
                      
                      const newTechnologies = [...data.technologies];
                      newTechnologies[techIndex] = updatedTech;
                      updateContentField(['technologies'], newTechnologies);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    onClick={() => {
                      removeArrayItem(['technologies'], techIndex);
                    }}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
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
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
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
            <p className="text-sm text-slate-500">No CTA buttons added yet. Add one above.</p>
          )}
        </div>
        
        <Separator />
        
        <div>
          <ImageUpload 
            label="Profile Picture (Optional)"
            currentImagePath={data.profilePicture} 
            onImageUploaded={(path) => updateContentField(['profilePicture'], path)}
          />
          <p className="text-xs text-slate-500 mt-1">
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
                  className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md"
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
                    className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md"
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
                  <Button 
                    variant="destructive" 
                    size="sm"
                    className="mr-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeArrayItem(['projects'], projectIndex);
                    }}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
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
              <p className="text-sm text-slate-500">No images in the gallery yet. Upload some images above.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="relative aspect-square rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img 
                        src={image} 
                        alt={`Gallery image ${index + 1}`} 
                        className="object-cover w-full h-full" 
                      />
                    </div>
                    <Button 
                      variant="destructive" 
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        const newImages = [...data.images];
                        newImages.splice(index, 1);
                        updateContentField(['images'], newImages);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="text-xs text-slate-500 mt-1 truncate">{image.split('/').pop()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render the appropriate form based on section
  const renderSectionForm = () => {
    switch (currentSection) {
      case 'hero':
        return renderHeroForm();
      case 'about':
        return renderAboutForm();
      case 'experience':
        return renderExperienceForm();
      case 'skills':
        return renderSkillsForm();
      case 'projects':
        return renderProjectsForm();
      case 'gallery':
        return renderGalleryForm();
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
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
      case 'experience':
        return <Briefcase className="w-4 h-4 mr-2" />;
      case 'skills':
        return <Wrench className="w-4 h-4 mr-2" />;
      case 'projects':
        return <Layers className="w-4 h-4 mr-2" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Content Management</h1>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sections</CardTitle>
                <CardDescription>Choose a section to edit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sections.map((section) => (
                    <Button
                      key={section}
                      variant={section === currentSection ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => handleSectionChange(section)}
                    >
                      {getSectionIcon(section)}
                      {section.charAt(0).toUpperCase() + section.slice(1)}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Editor */}
          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>
                    Editing: {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant={editMode === "form" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setEditMode("form")}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Form
                    </Button>
                    <Button 
                      variant={editMode === "json" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setEditMode("json")}
                    >
                      <Code className="w-4 h-4 mr-2" />
                      JSON
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {editMode === "form" ? 
                    "Edit the content using the form below" : 
                    "Edit the JSON content below. Be careful to maintain valid JSON format."
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {editMode === "form" ? (
                    <div className="space-y-6">
                      {renderSectionForm()}
                      <Button
                        className="w-full"
                        onClick={handleFormContentUpdate}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="editor">JSON Content</Label>
                        <Textarea
                          id="editor"
                          className="font-mono h-[500px] p-4"
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                        />
                      </div>
                      <Button
                        className="w-full"
                        onClick={handleJsonContentUpdate}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save JSON Changes
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;