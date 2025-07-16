import { useQuery } from "@tanstack/react-query";
import { Tag as CertificateIcon, Search, Filter } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { CertificateCard } from "@/components/ui/certificate-card";
import type { Work, Tag } from "@shared/schema";

interface WorkWithCertificate {
  work: Work;
  certificate: Tag;
}

export default function Certificates() {
  const [searchTerm, setSearchTerm] = useState("");
  
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
    <div className="pt-20 min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text mb-4">
            Your Certificates
          </h1>
          <p className="text-xl text-gray-300">
            Blockchain-verified certificates for all your protected works
          </p>
        </div>

        {/* Search and Filter */}
        <GlassCard className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search by title, creator, or certificate ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white bg-opacity-10 border-white border-opacity-20 text-white placeholder-gray-400"
              />
            </div>
            <Button variant="outline" className="glass-morphism">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </GlassCard>

        {/* Certificates Grid */}
        {filteredWorks.length > 0 ? (
          <div className="space-y-8">
            {filteredWorks.map(({ work, certificate }) => (
              <CertificateCard 
                key={work.id} 
                work={work} 
                certificate={certificate} 
              />
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
