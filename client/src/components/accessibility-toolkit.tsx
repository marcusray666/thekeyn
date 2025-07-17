import { useState, useEffect } from "react";
import { Eye, EyeOff, Palette, Contrast, Sun, Moon, Settings, Check, AlertTriangle, CheckCircle, RotateCcw } from "lucide-react";
import { analyzeContrast, validatePageAccessibility, extractPageColors, simulateColorBlindness } from "@/utils/accessibility";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme-provider";

interface AccessibilitySettings {
  highContrast: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  fontSize: number;
  motionReduce: boolean;
  focusIndicator: boolean;
  contrastRatio: number;
  darkMode: boolean;
}

const colorBlindFilters = {
  protanopia: 'url(#protanopia-filter)',
  deuteranopia: 'url(#deuteranopia-filter)',
  tritanopia: 'url(#tritanopia-filter)',
};

const contrastLevels = {
  AA: 4.5,
  AAA: 7.0,
};

export function AccessibilityToolkit() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    colorBlindMode: 'none',
    fontSize: 100,
    motionReduce: false,
    focusIndicator: true,
    contrastRatio: 4.5,
    darkMode: false,
  });

  useEffect(() => {
    // Load accessibility settings from localStorage
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Save settings to localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    
    // Apply accessibility settings to document
    applyAccessibilitySettings(settings);
  }, [settings]);

  const applyAccessibilitySettings = (settings: AccessibilitySettings) => {
    const root = document.documentElement;
    
    // High contrast mode
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Color blind mode
    root.style.filter = settings.colorBlindMode !== 'none' 
      ? colorBlindFilters[settings.colorBlindMode] 
      : 'none';

    // Font size adjustment
    root.style.fontSize = `${settings.fontSize}%`;

    // Motion reduction
    if (settings.motionReduce) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Focus indicators
    if (settings.focusIndicator) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }
  };

  const [pageAnalysis, setPageAnalysis] = useState<any>(null);

  // Real-time page analysis
  useEffect(() => {
    const analyzeCurrentPage = () => {
      const analysis = validatePageAccessibility();
      setPageAnalysis(analysis);
    };

    analyzeCurrentPage();
    
    // Re-analyze when theme changes
    const observer = new MutationObserver(analyzeCurrentPage);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    return () => observer.disconnect();
  }, [theme, settings]);

  const getContrastBadge = (level: string, ratio: number) => {
    const levelColors = {
      'AAA': 'bg-green-600 text-white',
      'AA': 'bg-yellow-600 text-white', 
      'Fail': 'bg-red-600 text-white'
    };
    
    return (
      <Badge className={levelColors[level as keyof typeof levelColors] || levelColors.Fail}>
        {level} ({ratio.toFixed(1)}:1)
      </Badge>
    );
  };

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const presetConfigurations = [
    {
      name: "Low Vision",
      description: "High contrast, large text, enhanced focus",
      settings: {
        highContrast: true,
        fontSize: 150,
        focusIndicator: true,
        motionReduce: true,
        contrastRatio: 7.0,
      }
    },
    {
      name: "Color Blind Friendly",
      description: "Deuteranopia simulation with high contrast",
      settings: {
        colorBlindMode: 'deuteranopia' as const,
        highContrast: true,
        focusIndicator: true,
      }
    },
    {
      name: "Motion Sensitive",
      description: "Reduced animations and transitions",
      settings: {
        motionReduce: true,
        focusIndicator: true,
      }
    }
  ];

  return (
    <>
      {/* SVG Filters for Color Blind Simulation */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="protanopia-filter">
            <feColorMatrix type="matrix" values="0.567 0.433 0 0 0 0.558 0.442 0 0 0 0 0.242 0.758 0 0 0 0 0 1 0" />
          </filter>
          <filter id="deuteranopia-filter">
            <feColorMatrix type="matrix" values="0.625 0.375 0 0 0 0.7 0.3 0 0 0 0 0.3 0.7 0 0 0 0 0 1 0" />
          </filter>
          <filter id="tritanopia-filter">
            <feColorMatrix type="matrix" values="0.95 0.05 0 0 0 0 0.433 0.567 0 0 0.475 0.525 0 0 0 0 0 0 1 0" />
          </filter>
        </defs>
      </svg>

      {/* Floating Accessibility Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 rounded-full w-12 h-12 p-0 glass-morphism shadow-lg"
        aria-label="Open accessibility toolkit"
      >
        <Eye className="h-5 w-5" />
      </Button>

      {/* Accessibility Panel */}
      {isOpen && (
        <Card className="fixed bottom-20 right-4 z-50 w-80 max-h-96 overflow-y-auto glass-morphism shadow-xl border">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Accessibility Toolkit</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Reset Button */}
              <Button
                variant="destructive"
                onClick={() => {
                  const defaultSettings = {
                    highContrast: false,
                    fontSize: 100,
                    focusIndicator: false,
                    motionReduce: false,
                    colorBlindMode: 'none' as ColorBlindnessType
                  };
                  setSettings(defaultSettings);
                  localStorage.setItem('accessibility-settings', JSON.stringify(defaultSettings));
                  setTheme('light');
                }}
                className="w-full mb-4"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>

              {/* High Contrast */}
              <div className="flex items-center justify-between">
                <Label htmlFor="high-contrast" className="text-sm text-foreground">
                  High Contrast
                </Label>
                <Switch
                  id="high-contrast"
                  checked={settings.highContrast}
                  onCheckedChange={(checked) => updateSetting('highContrast', checked)}
                />
              </div>

              {/* Color Blind Mode */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  Color Vision
                </Label>
                <Select
                  value={settings.colorBlindMode}
                  onValueChange={(value) => updateSetting('colorBlindMode', value as any)}
                >
                  <SelectTrigger className="glass-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Normal Vision</SelectItem>
                    <SelectItem value="protanopia">Protanopia (Red-blind)</SelectItem>
                    <SelectItem value="deuteranopia">Deuteranopia (Green-blind)</SelectItem>
                    <SelectItem value="tritanopia">Tritanopia (Blue-blind)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Font Size */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  Font Size: {settings.fontSize}%
                </Label>
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={([value]) => updateSetting('fontSize', value)}
                  min={75}
                  max={200}
                  step={25}
                  className="w-full"
                />
              </div>

              {/* Motion Reduction */}
              <div className="flex items-center justify-between">
                <Label htmlFor="motion-reduce" className="text-sm text-foreground">
                  Reduce Motion
                </Label>
                <Switch
                  id="motion-reduce"
                  checked={settings.motionReduce}
                  onCheckedChange={(checked) => updateSetting('motionReduce', checked)}
                />
              </div>

              {/* Enhanced Focus */}
              <div className="flex items-center justify-between">
                <Label htmlFor="focus-indicator" className="text-sm text-foreground">
                  Enhanced Focus
                </Label>
                <Switch
                  id="focus-indicator"
                  checked={settings.focusIndicator}
                  onCheckedChange={(checked) => updateSetting('focusIndicator', checked)}
                />
              </div>

              {/* Real-time Accessibility Analysis */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  Accessibility Analysis
                </Label>
                
                {pageAnalysis && (
                  <>
                    {/* Overall Score */}
                    <div className="flex items-center justify-between p-3 rounded-lg glass-input">
                      <span className="text-sm font-medium">Accessibility Score</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{pageAnalysis.score}%</span>
                        {pageAnalysis.score >= 80 ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                    </div>

                    {/* Contrast Results */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Text Contrast:</span>
                        {getContrastBadge(pageAnalysis.textContrast.level, pageAnalysis.textContrast.ratio)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Primary Contrast:</span>
                        {getContrastBadge(pageAnalysis.primaryContrast.level, pageAnalysis.primaryContrast.ratio)}
                      </div>
                    </div>

                    {/* Issues */}
                    {pageAnalysis.issues.length > 0 && (
                      <div className="p-2 rounded glass-input">
                        <div className="text-xs font-medium text-foreground mb-1">Issues Found:</div>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {pageAnalysis.issues.map((issue: string, index: number) => (
                            <li key={index} className="flex items-start gap-1">
                              <span className="text-yellow-600">•</span>
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Theme Integration */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  Accessible Themes
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={theme === 'liquid-glass' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('liquid-glass')}
                    className="glass-input"
                  >
                    <Moon className="h-3 w-3 mr-1" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === 'ethereal-ivory' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('ethereal-ivory')}
                    className="glass-input"
                  >
                    <Sun className="h-3 w-3 mr-1" />
                    Light
                  </Button>
                </div>
                
                {/* Color Blindness Simulation Preview */}
                {settings.colorBlindMode !== 'none' && (
                  <div className="mt-2 p-2 rounded glass-input">
                    <div className="text-xs font-medium text-foreground mb-1">
                      Simulating: {settings.colorBlindMode.charAt(0).toUpperCase() + settings.colorBlindMode.slice(1)}
                    </div>
                    <div className="flex gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reset Settings */}
              <Button
                variant="outline"
                size="sm"
                className="w-full glass-input"
                onClick={() => setSettings({
                  highContrast: false,
                  colorBlindMode: 'none',
                  fontSize: 100,
                  motionReduce: false,
                  focusIndicator: true,
                  contrastRatio: 4.5,
                  darkMode: false,
                })}
              >
                Reset to Defaults
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}