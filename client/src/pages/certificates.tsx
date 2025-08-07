import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tag as CertificateIcon, Search, Filter } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { CertificateCard } from "@/components/ui/certificate-card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Work, Tag } from "@shared/schema";

interface WorkWithCertificate {
  work: Work;
  certificate: Tag;
}

export default function Certificates() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const shareToCommunityMutation = useMutation({
    mutationFn: (workId: number) => 
      apiRequest("/api/community/share", {
        method: "POST",
        body: { workId }
      }),
    onSuccess: () => {
      toast({
        title: "Shared to Community",
        description: "Your protected work has been shared to the community feed with PROTECTED marking."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
    },
    onError: () => {
      toast({
        title: "Share Failed",
        description: "Unable to share to community. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleShareToCommunity = (workId: number) => {
    shareToCommunityMutation.mutate(workId);
  };
  
  const { data: works, isLoading: worksLoading } = useQuery<Work[]>({
    queryKey: ["/api/works"],
  });

  const { data: certificates, isLoading: certificatesLoading } = useQuery<Tag[]>({
    queryKey: ["/api/certificates"],
  });

  const worksWithCertificates: WorkWithCertificate[] = 
    works && certificates
      ? works.map(work => ({
          work,
          certificate: certificates.find(cert => cert.workId === work.id)!
        })).filter(item => item.certificate)
      : [];

  const filteredWorks = worksWithCertificates.filter(({ work }) =>
    work.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    work.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    work.certificateId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (worksLoading || certificatesLoading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="glass-morphism rounded-2xl p-8">
          <div className="animate-pulse text-center">
            <div className="h-8 bg-gray-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FE3F5E]/5 via-transparent to-[#FFD200]/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FE3F5E]/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFD200]/10 rounded-full blur-[100px]"></div>
      
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10 pt-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text mb-4">
            Your Certificates
          </h1>
          <p className="text-xl text-white/60">
            Blockchain-verified certificates for all your protected works
          </p>
        </div>

        {/* Search and Filter */}
        <GlassCard className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={20} />
              <Input
                placeholder="Search by title, creator, or certificate ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black/20 backdrop-blur-sm border-white/10 text-white placeholder-white/60"
              />
            </div>
            <Button variant="ghost" className="bg-black/20 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white hover:bg-white/10">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </GlassCard>

        {/* Certificates Grid */}
        {filteredWorks.length > 0 ? (
          <div className="space-y-6 px-4">
            {filteredWorks.map(({ work, certificate }) => (
              <div key={work.id} className="border border-white/20 rounded-2xl p-4 bg-white/5 backdrop-blur-sm">
                <CertificateCard 
                  work={work} 
                  certificate={certificate}
                  onShareToCommunity={() => handleShareToCommunity(work.id)}
                />
              </div>
            ))}
          </div>
        ) : worksWithCertificates.length === 0 ? (
          <div className="text-center py-20">
            <GlassCard className="max-w-md mx-auto">
              <CertificateIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No Certificates Yet
              </h3>
              <p className="text-gray-500 mb-6">
                Upload and register your creative works to generate certificates
              </p>
              <Button className="btn-glass">
                Create Your First Tag
              </Button>
            </GlassCard>
          </div>
        ) : (
          <div className="text-center py-20">
            <GlassCard className="max-w-md mx-auto">
              <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No Results Found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search terms or clear the search to see all certificates
              </p>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}
