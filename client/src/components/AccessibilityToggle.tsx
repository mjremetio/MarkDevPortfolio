import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { Accessibility } from "lucide-react";

const AccessibilityToggle = () => {
  const { togglePanel } = useAccessibility();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline" 
            size="icon"
            onClick={togglePanel}
            className="ml-2 relative"
            aria-label="Accessibility settings"
          >
            <Accessibility className="h-5 w-5" />
            <span className="sr-only">Accessibility settings</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Accessibility settings (Alt+A)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AccessibilityToggle;