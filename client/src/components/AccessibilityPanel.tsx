import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  useAccessibility,
  type ColorTheme,
  type FontSize,
  type FontFamily,
} from '@/contexts/AccessibilityContext';
import {
  Text,
  Type,
  PaintBucket,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Keyboard,
  Eye,
  MousePointer,
  ZoomIn,
  RefreshCw,
  AlignJustify
} from 'lucide-react';

const AccessibilityPanel = () => {
  const { settings, updateSettings, resetSettings, isOpen, togglePanel } = useAccessibility();
  const [activeTab, setActiveTab] = useState('display');
  
  // Handle keyboard navigation and shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If panel is open, handle accessibility panel shortcuts
      if (isOpen) {
        // ESC key to close
        if (e.key === 'Escape') {
          togglePanel();
        }
        
        // Tab navigation is handled by the browser natively
        
        // Arrow keys for tab navigation
        if (e.altKey && e.key === 'ArrowRight') {
          e.preventDefault();
          if (activeTab === 'display') setActiveTab('text');
          else if (activeTab === 'text') setActiveTab('keyboard');
        }
        
        if (e.altKey && e.key === 'ArrowLeft') {
          e.preventDefault();
          if (activeTab === 'text') setActiveTab('display');
          else if (activeTab === 'keyboard') setActiveTab('text');
        }
      } else {
        // If panel is closed, listen for Alt+A to open it
        if (e.altKey && e.key === 'a') {
          e.preventDefault();
          togglePanel();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, togglePanel, activeTab]);

  return (
    <Dialog open={isOpen} onOpenChange={togglePanel}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" aria-labelledby="accessibility-dialog-title">
        <DialogHeader>
          <DialogTitle id="accessibility-dialog-title" className="flex items-center">
            <Eye className="mr-2 h-5 w-5" />
            Accessibility Settings
          </DialogTitle>
          <DialogDescription>
            Customize your experience to make this site work better for you. Settings are automatically saved.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="display" className="flex items-center gap-2" data-test="display-tab">
              <PaintBucket className="h-4 w-4" />
              <span>Display</span>
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2" data-test="text-tab">
              <Text className="h-4 w-4" />
              <span>Text</span>
            </TabsTrigger>
            <TabsTrigger value="keyboard" className="flex items-center gap-2" data-test="keyboard-tab">
              <Keyboard className="h-4 w-4" />
              <span>Navigation</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="display" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="colorTheme" className="flex items-center gap-2 mb-2">
                  <PaintBucket className="h-4 w-4" />
                  Color Theme
                </Label>
                <Select
                  value={settings.colorTheme}
                  onValueChange={(value: ColorTheme) => updateSettings({ colorTheme: value })}
                >
                  <SelectTrigger id="colorTheme" aria-label="Select color theme">
                    <SelectValue placeholder="Select color theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="light">Light Mode</SelectItem>
                    <SelectItem value="dark">Dark Mode</SelectItem>
                    <SelectItem value="high-contrast">High Contrast</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="reducedAnimationsSwitch" className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Reduced Animations
                  </Label>
                  <Switch
                    id="reducedAnimationsSwitch"
                    checked={settings.reducedAnimations}
                    onCheckedChange={(checked) => updateSettings({ reducedAnimations: checked })}
                    aria-label="Toggle reduced animations"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Minimizes motion effects across the site
                </p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="enhancedFocusSwitch" className="flex items-center gap-2">
                    <MousePointer className="h-4 w-4" />
                    Enhanced Focus Indicators
                  </Label>
                  <Switch
                    id="enhancedFocusSwitch"
                    checked={settings.enhancedFocus}
                    onCheckedChange={(checked) => updateSettings({ enhancedFocus: checked })}
                    aria-label="Toggle enhanced focus indicators"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Makes focus outlines more visible when using keyboard navigation
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="text" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="fontSize" className="flex items-center gap-2 mb-2">
                  <ZoomIn className="h-4 w-4" />
                  Font Size
                </Label>
                <Select
                  value={settings.fontSize}
                  onValueChange={(value: FontSize) => updateSettings({ fontSize: value })}
                >
                  <SelectTrigger id="fontSize" aria-label="Select font size">
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium (Default)</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="x-large">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="fontFamily" className="flex items-center gap-2 mb-2">
                  <Type className="h-4 w-4" />
                  Font Family
                </Label>
                <Select
                  value={settings.fontFamily}
                  onValueChange={(value: FontFamily) => updateSettings({ fontFamily: value })}
                >
                  <SelectTrigger id="fontFamily" aria-label="Select font family">
                    <SelectValue placeholder="Select font family" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sans-serif">Sans-serif (Default)</SelectItem>
                    <SelectItem value="serif">Serif</SelectItem>
                    <SelectItem value="dyslexic">Dyslexia-friendly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlignJustify className="h-4 w-4" />
                  <Label htmlFor="lineHeight">Line Height: {settings.lineHeight.toFixed(1)}</Label>
                </div>
                <Slider
                  id="lineHeight"
                  min={1.0}
                  max={2.5}
                  step={0.1}
                  value={[settings.lineHeight]}
                  onValueChange={([value]) => updateSettings({ lineHeight: value })}
                  aria-label="Adjust line height"
                  aria-valuemin={1.0}
                  aria-valuemax={2.5}
                  aria-valuenow={settings.lineHeight}
                />
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>Compact</span>
                  <span>Spacious</span>
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Text className="h-4 w-4" />
                  <Label htmlFor="letterSpacing">Letter Spacing: {settings.letterSpacing}px</Label>
                </div>
                <Slider
                  id="letterSpacing"
                  min={0}
                  max={10}
                  step={0.5}
                  value={[settings.letterSpacing]}
                  onValueChange={([value]) => updateSettings({ letterSpacing: value })}
                  aria-label="Adjust letter spacing"
                  aria-valuemin={0}
                  aria-valuemax={10}
                  aria-valuenow={settings.letterSpacing}
                />
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>Normal</span>
                  <span>Expanded</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="keyboard" className="space-y-6">
            <div className="space-y-4">
              <div className="text-sm space-y-2">
                <h3 className="font-semibold text-base flex items-center gap-2 mb-3">
                  <Keyboard className="h-4 w-4" />
                  Keyboard Shortcuts
                </h3>
                
                <div className="grid grid-cols-[1fr_2fr] gap-2">
                  <div className="flex items-center gap-1 font-mono">
                    <kbd className="bg-muted px-2 py-1 rounded text-xs">Alt</kbd> + <kbd className="bg-muted px-2 py-1 rounded text-xs">A</kbd>
                  </div>
                  <div>Open/close accessibility panel</div>
                  
                  <div className="flex items-center gap-1 font-mono">
                    <kbd className="bg-muted px-2 py-1 rounded text-xs">Tab</kbd>
                  </div>
                  <div>Navigate between focusable elements</div>
                  
                  <div className="flex items-center gap-1 font-mono">
                    <kbd className="bg-muted px-2 py-1 rounded text-xs">Shift</kbd> + <kbd className="bg-muted px-2 py-1 rounded text-xs">Tab</kbd>
                  </div>
                  <div>Navigate backward</div>
                  
                  <div className="flex items-center gap-1 font-mono">
                    <kbd className="bg-muted px-2 py-1 rounded text-xs">Esc</kbd>
                  </div>
                  <div>Close panel or dialog</div>
                  
                  <div className="flex items-center gap-1 font-mono">
                    <kbd className="bg-muted px-2 py-1 rounded text-xs">Alt</kbd> + <kbd className="bg-muted px-2 py-1 rounded text-xs">←</kbd> / <kbd className="bg-muted px-2 py-1 rounded text-xs">→</kbd>
                  </div>
                  <div>Navigate between settings tabs</div>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <p className="text-sm mt-2">
                  The website is fully navigable using a keyboard. Use Tab to move between elements and Enter to activate buttons or links.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
          <div className="flex w-full sm:w-auto gap-2">
            <Button
              variant="outline"
              onClick={resetSettings}
              className="flex-1 sm:flex-none"
              aria-label="Reset all settings to default values"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset to Default
            </Button>
          </div>
          <Button onClick={togglePanel} className="flex-1 sm:flex-none">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AccessibilityPanel;