import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, LogOut } from "lucide-react";

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sections, setSections] = useState<string[]>([]);
  const [currentSection, setCurrentSection] = useState<string>("");
  const [contentData, setContentData] = useState<any>(null);
  const [editedContent, setEditedContent] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
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

  // Handle content update
  const handleContentUpdate = async () => {
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

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      setLocation('/maglogin');
    } catch (error) {
      console.error('Error logging out:', error);
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
                <CardTitle>
                  Editing: {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}
                </CardTitle>
                <CardDescription>
                  Edit the JSON content below. Be careful to maintain valid JSON format.
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                    onClick={handleContentUpdate}
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;