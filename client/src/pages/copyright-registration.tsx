import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Building2, 
  FileText, 
  Globe, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ExternalLink,
  Download,
  Upload,
  DollarSign,
  Calendar,
  Info,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { LiquidGlassLoader } from "@/components/ui/liquid-glass-loader";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CopyrightOffice {
  id: string;
  name: string;
  country: string;
  website: string;
  processingTime: string;
  fee: string;
  requirements: string[];
  supportedTypes: string[];
  status: 'active' | 'limited' | 'coming_soon';
}

interface RegistrationApplication {
  id: string;
  workId: number;
  officeId: string;
  status: 'draft' | 'submitted' | 'processing' | 'approved' | 'rejected';
  submissionDate: string;
  registrationNumber?: string;
  estimatedCompletion?: string;
  fee: string;
  documents: string[];
}

const COPYRIGHT_OFFICES: CopyrightOffice[] = [
  {
    id: 'us_copyright_office',
    name: 'U.S. Copyright Office',
    country: 'United States',
    website: 'https://copyright.gov',
    processingTime: '3-6 months',
    fee: '$45-$125',
    requirements: [
      'Completed application form',
      'Copy of the work being registered',
      'Filing fee payment',
      'Deposit requirements met'
    ],
    supportedTypes: ['literary', 'visual_arts', 'performing_arts', 'sound_recordings', 'motion_pictures'],
    status: 'active'
  },
  {
    id: 'uk_ipo',
    name: 'UK Intellectual Property Office',
    country: 'United Kingdom',
    website: 'https://ipo.gov.uk',
    processingTime: '2-4 months',
    fee: '£4-£20',
    requirements: [
      'Application form completed',
      'Description of the work',
      'Evidence of creation date',
      'Payment of fees'
    ],
    supportedTypes: ['literary', 'artistic', 'musical', 'dramatic'],
    status: 'active'
  },
  {
    id: 'cipo_canada',
    name: 'Canadian Intellectual Property Office',
    country: 'Canada',
    website: 'https://cipo.gc.ca',
    processingTime: '4-8 weeks',
    fee: 'CAD $50-$200',
    requirements: [
      'Completed application',
      'Copy of the work',
      'Declaration of authorship',
      'Filing fees'
    ],
    supportedTypes: ['literary', 'artistic', 'musical', 'dramatic'],
    status: 'active'
  },
  {
    id: 'eu_copyright',
    name: 'European Union Copyright',
    country: 'European Union',
    website: 'https://euipo.europa.eu',
    processingTime: '6-12 months',
    fee: '€100-€500',
    requirements: [
      'EU application form',
      'Proof of originality',
      'Translation if required',
      'Processing fees'
    ],
    supportedTypes: ['all'],
    status: 'limited'
  }
];

export default function CopyrightRegistration() {
  const [selectedOffice, setSelectedOffice] = useState<string>('');
  const [selectedWork, setSelectedWork] = useState<number | null>(null);
  const [applicationData, setApplicationData] = useState({
    authorName: '',
    workTitle: '',
    creationDate: '',
    publicationDate: '',
    workType: '',
    description: '',
    claimType: 'original',
    agreeToTerms: false
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's works for registration
  const { data: works, isLoading: worksLoading } = useQuery({
    queryKey: ["/api/works"]
  });

  // Fetch existing registration applications
  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ["/api/copyright-registrations"]
  });

  // Submit registration application
  const submitApplication = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest(`/api/copyright-registrations`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your copyright registration application has been submitted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/copyright-registrations"] });
      // Reset form
      setApplicationData({
        authorName: '',
        workTitle: '',
        creationDate: '',
        publicationDate: '',
        workType: '',
        description: '',
        claimType: 'original',
        agreeToTerms: false
      });
      setSelectedWork(null);
      setSelectedOffice('');
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = () => {
    if (!selectedOffice || !selectedWork) {
      toast({
        title: "Missing Information",
        description: "Please select both a copyright office and a work to register.",
        variant: "destructive",
      });
      return;
    }

    if (!applicationData.agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions to proceed.",
        variant: "destructive",
      });
      return;
    }

    const selectedWorkData = works?.find((w: any) => w.id === selectedWork);
    const office = COPYRIGHT_OFFICES.find(o => o.id === selectedOffice);

    submitApplication.mutate({
      workId: selectedWork,
      officeId: selectedOffice,
      applicationData: {
        ...applicationData,
        workTitle: selectedWorkData?.title || applicationData.workTitle,
        authorName: applicationData.authorName || user?.username
      }
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'submitted': return <Upload className="h-4 w-4 text-blue-400" />;
      case 'processing': return <Clock className="h-4 w-4 text-orange-400" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'rejected': return <AlertCircle className="h-4 w-4 text-red-400" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'submitted': return 'Submitted';
      case 'processing': return 'Processing';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return 'Unknown';
    }
  };

  if (worksLoading || appsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 p-6">
        <div className="max-w-7xl mx-auto">
          <LiquidGlassLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Copyright Registration
          </h1>
          <p className="text-gray-400">
            Submit your works for official government copyright registration
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Application Form */}
          <div className="lg:col-span-2">
            <GlassCard>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  New Registration Application
                </h2>

                <div className="space-y-6">
                  {/* Select Copyright Office */}
                  <div>
                    <Label htmlFor="office" className="text-white mb-2 block">
                      Copyright Office *
                    </Label>
                    <Select value={selectedOffice} onValueChange={setSelectedOffice}>
                      <SelectTrigger className="glass-input">
                        <SelectValue placeholder="Select a copyright office" />
                      </SelectTrigger>
                      <SelectContent>
                        {COPYRIGHT_OFFICES.map((office) => (
                          <SelectItem 
                            key={office.id} 
                            value={office.id}
                            disabled={office.status === 'coming_soon'}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span>{office.name}</span>
                              <span className="text-sm text-gray-400">{office.country}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Select Work */}
                  <div>
                    <Label htmlFor="work" className="text-white mb-2 block">
                      Work to Register *
                    </Label>
                    <Select value={selectedWork?.toString() || ''} onValueChange={(value) => setSelectedWork(parseInt(value))}>
                      <SelectTrigger className="glass-input">
                        <SelectValue placeholder="Select a work from your portfolio" />
                      </SelectTrigger>
                      <SelectContent>
                        {works?.map((work: any) => (
                          <SelectItem key={work.id} value={work.id.toString()}>
                            <div className="flex items-center space-x-2">
                              <span>{work.title}</span>
                              <span className="text-sm text-gray-400">({work.mimeType})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Author Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="authorName" className="text-white mb-2 block">
                        Author Name *
                      </Label>
                      <Input
                        id="authorName"
                        value={applicationData.authorName}
                        onChange={(e) => setApplicationData({...applicationData, authorName: e.target.value})}
                        placeholder={user?.username || "Enter author name"}
                        className="glass-input"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="workType" className="text-white mb-2 block">
                        Work Type *
                      </Label>
                      <Select 
                        value={applicationData.workType} 
                        onValueChange={(value) => setApplicationData({...applicationData, workType: value})}
                      >
                        <SelectTrigger className="glass-input">
                          <SelectValue placeholder="Select work type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="literary">Literary Work</SelectItem>
                          <SelectItem value="visual_arts">Visual Arts</SelectItem>
                          <SelectItem value="performing_arts">Performing Arts</SelectItem>
                          <SelectItem value="sound_recordings">Sound Recording</SelectItem>
                          <SelectItem value="motion_pictures">Motion Picture</SelectItem>
                          <SelectItem value="musical">Musical Work</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="creationDate" className="text-white mb-2 block">
                        Creation Date *
                      </Label>
                      <Input
                        id="creationDate"
                        type="date"
                        value={applicationData.creationDate}
                        onChange={(e) => setApplicationData({...applicationData, creationDate: e.target.value})}
                        className="glass-input"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="publicationDate" className="text-white mb-2 block">
                        Publication Date (if published)
                      </Label>
                      <Input
                        id="publicationDate"
                        type="date"
                        value={applicationData.publicationDate}
                        onChange={(e) => setApplicationData({...applicationData, publicationDate: e.target.value})}
                        className="glass-input"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="description" className="text-white mb-2 block">
                      Work Description *
                    </Label>
                    <Textarea
                      id="description"
                      value={applicationData.description}
                      onChange={(e) => setApplicationData({...applicationData, description: e.target.value})}
                      placeholder="Describe the nature and content of your work..."
                      className="glass-input min-h-[100px]"
                    />
                  </div>

                  {/* Terms Agreement */}
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={applicationData.agreeToTerms}
                      onCheckedChange={(checked) => setApplicationData({...applicationData, agreeToTerms: !!checked})}
                    />
                    <Label htmlFor="terms" className="text-sm text-gray-300 leading-relaxed">
                      I certify that I am the author of this work and have the right to register it for copyright. 
                      I understand that false statements may result in penalties and agree to the selected copyright office's terms and conditions.
                    </Label>
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmit}
                    disabled={submitApplication.isPending || !selectedOffice || !selectedWork || !applicationData.agreeToTerms}
                    className="w-full btn-glass py-3 rounded-xl font-semibold text-white"
                  >
                    {submitApplication.isPending ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting Application...
                      </div>
                    ) : (
                      <>
                        <Shield className="mr-2 h-5 w-5" />
                        Submit Registration Application
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Office Info */}
            {selectedOffice && (
              <GlassCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Building2 className="mr-2 h-5 w-5" />
                    Office Information
                  </h3>
                  
                  {(() => {
                    const office = COPYRIGHT_OFFICES.find(o => o.id === selectedOffice);
                    if (!office) return null;
                    
                    return (
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-400">Processing Time</p>
                          <p className="text-white">{office.processingTime}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-400">Fees</p>
                          <p className="text-white flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {office.fee}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-400">Requirements</p>
                          <ul className="text-sm text-white space-y-1">
                            {office.requirements.map((req, index) => (
                              <li key={index} className="flex items-start">
                                <span className="w-1 h-1 bg-purple-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <Button
                          variant="outline"
                          className="w-full border-gray-600 text-gray-300 hover:bg-white hover:bg-opacity-5"
                          onClick={() => window.open(office.website, '_blank')}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Visit Official Website
                        </Button>
                      </div>
                    );
                  })()}
                </div>
              </GlassCard>
            )}

            {/* Info Box */}
            <GlassCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Info className="mr-2 h-5 w-5" />
                  Important Information
                </h3>
                
                <div className="space-y-3 text-sm text-gray-300">
                  <p>
                    Copyright registration provides additional legal protections and is required 
                    for certain legal actions in many jurisdictions.
                  </p>
                  
                  <p>
                    Processing times and fees vary by country and work type. Some offices may 
                    require additional documentation.
                  </p>
                  
                  <p>
                    Your Prooff certificate serves as valuable supporting evidence for your 
                    registration applications.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Existing Applications */}
        {applications && applications.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Your Registration Applications</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {applications.map((app: RegistrationApplication) => {
                const office = COPYRIGHT_OFFICES.find(o => o.id === app.officeId);
                const work = works?.find((w: any) => w.id === app.workId);
                
                return (
                  <GlassCard key={app.id}>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white truncate">
                          {work?.title || 'Unknown Work'}
                        </h3>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(app.status)}
                          <span className="text-sm text-gray-300">
                            {getStatusText(app.status)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Office:</span>
                          <span className="text-white">{office?.name || 'Unknown'}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-400">Submitted:</span>
                          <span className="text-white">
                            {new Date(app.submissionDate).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-400">Fee:</span>
                          <span className="text-white">{app.fee}</span>
                        </div>
                        
                        {app.registrationNumber && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Registration #:</span>
                            <span className="text-green-400 font-mono">{app.registrationNumber}</span>
                          </div>
                        )}
                      </div>
                      
                      {app.status === 'approved' && (
                        <Button
                          variant="outline"
                          className="w-full mt-4 border-green-600 text-green-300 hover:bg-green-900 hover:bg-opacity-20"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download Certificate
                        </Button>
                      )}
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}