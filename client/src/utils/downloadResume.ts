import { toast } from "@/hooks/use-toast";

export const downloadResume = () => {
  try {
    // Create a link element
    const link = document.createElement('a');
    
    // Set the href to the resume download endpoint
    link.href = '/api/download-resume';
    
    // Set a filename
    link.download = 'Mark_Remetio_CV.pdf';
    
    // Append to the body
    document.body.appendChild(link);
    
    // Trigger the click
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    
    // Show success message
    toast({
      title: "Success",
      description: "Resume download started",
    });
  } catch (error) {
    console.error('Error downloading resume:', error);
    
    // Show error message
    toast({
      title: "Error",
      description: "Failed to download resume. Please try again later.",
      variant: "destructive",
    });
  }
};