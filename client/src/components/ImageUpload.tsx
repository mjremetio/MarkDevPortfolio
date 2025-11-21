import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onImageUploaded: (path: string) => void;
  currentImagePath?: string;
  label?: string;
}

export function ImageUpload({ onImageUploaded, currentImagePath, label = 'Image' }: ImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file (JPEG, PNG, etc.)',
          variant: 'destructive',
        });
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 5MB',
          variant: 'destructive',
        });
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select an image file before uploading',
        variant: 'destructive',
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: "include",
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({
          title: 'Upload successful',
          description: 'Image has been uploaded successfully',
        });
        
        // Pass the file path to the parent component
        onImageUploaded(data.filePath);
        
        // Clear the selection
        setSelectedFile(null);
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="image-upload">{label}</Label>
        <div className="mt-1 flex items-center gap-4">
          <Input 
            id="image-upload" 
            type="file" 
            accept="image/*"
            onChange={handleFileChange}
            className="flex-1"
          />
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || isUploading}
            className="whitespace-nowrap"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col gap-3">
        {(previewUrl || currentImagePath) && (
          <div className="border rounded-md p-2 max-w-[300px]">
            <p className="text-sm font-medium mb-2">
              {previewUrl ? 'Preview:' : 'Current Image:'}
            </p>
            <div className="relative aspect-video rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-h-full max-w-full object-contain" 
                />
              ) : currentImagePath ? (
                <img 
                  src={currentImagePath.startsWith('http') ? currentImagePath : currentImagePath} 
                  alt="Current image" 
                  onError={(e) => {
                    console.error('Error loading image:', currentImagePath);
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTguMzggMTMuODdsLTMtMi4xMmMtLjQzLS4zLS45OS0uMy0xLjQxIDBsLTMgMi4xMmMtLjQzLjMtLjU4Ljg3LS4zIDEuMzQuMy40Ny45Mi42MiAxLjQxLjNsLjg5LS42M3Y1LjI1YzAgLjQxLjM0Ljc1Ljc1Ljc1cy43NS0uMzQuNzUtLjc1di01LjI1bC44OS42M2MuMTYuMTIuMzUuMTcuNTMuMTcuMjkgMCAuNTgtLjE0Ljc1LS40Ny4yOC0uNDcuMTMtMS4wNC0uMy0xLjM0ek0xMSAxNEg3YzAtNC45NyA0LjAzLTkgOS05IDQuNzMgMCA4LjYgMy42NSA4Ljk1IDguMy4wNC41Mi40OCAxLjAyIDEgMS4wMi41NiAwIDEuMDMtLjQ3Ljk3LTEuMDJDMjYuNTIgNy4xOSAyMS40MSAyIDE2IDJjLTUuOTUgMC0xMSA0LjU1LTExLjk4IDEwLjI0QzQuMDcgMTIuNjcgMyAxMy43NSAzIDE1djVjMCAxLjEuOSAyIDIgMmg2YzEuMSAwIDItLjkgMi0ydi01YzAtLjcyLS40My0xLjIxLTEtMS40NVYxNHoiIGZpbGw9ImN1cnJlbnRDb2xvciIvPjwvc3ZnPg==';
                    e.currentTarget.alt = 'Image not found';
                  }}
                  className="max-h-full max-w-full object-contain" 
                />
              ) : (
                <ImageIcon className="h-10 w-10 text-slate-400" />
              )}
            </div>
          </div>
        )}
        
        {currentImagePath && (
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Current path: {currentImagePath}
          </div>
        )}
      </div>
    </div>
  );
}

// For multiple image uploads (for gallery)
interface MultipleImageUploadProps {
  onImagesUploaded: (paths: string[]) => void;
  label?: string;
}

export function MultipleImageUpload({ onImagesUploaded, label = 'Images' }: MultipleImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        title: 'No files selected',
        description: 'Please select image files before uploading',
        variant: 'destructive',
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('images', selectedFiles[i]);
      }
      
      const response = await fetch('/api/upload/multiple', {
        method: 'POST',
        credentials: "include",
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({
          title: 'Upload successful',
          description: `${data.filePaths.length} image(s) have been uploaded successfully`,
        });
        
        // Pass the file paths to the parent component
        onImagesUploaded(data.filePaths);
        
        // Clear the selection
        setSelectedFiles(null);
        // Reset the input field
        const input = document.getElementById('multiple-image-upload') as HTMLInputElement;
        if (input) input.value = '';
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload images',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="multiple-image-upload">{label}</Label>
        <div className="mt-1 flex items-center gap-4">
          <Input 
            id="multiple-image-upload" 
            type="file" 
            accept="image/*"
            multiple
            onChange={handleFilesChange}
            className="flex-1"
          />
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFiles || isUploading}
            className="whitespace-nowrap"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload {selectedFiles && selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="text-sm text-slate-500 dark:text-slate-400">
        You can select multiple files by holding Ctrl (or Cmd on Mac) while selecting.
      </div>
    </div>
  );
}
