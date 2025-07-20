import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, Shield, Search, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BlockchainVerificationGuideProps {
  blockchainHash: string;
  fileHash: string;
  verificationProof?: string;
}

export function BlockchainVerificationGuide({ 
  blockchainHash, 
  fileHash, 
  verificationProof 
}: BlockchainVerificationGuideProps) {
  const [activeTab, setActiveTab] = useState<'explanation' | 'verification' | 'tools'>('explanation');
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const parseVerificationProof = (proof: string) => {
    try {
      return JSON.parse(proof);
    } catch {
      return null;
    }
  };

  const proofData = verificationProof ? parseVerificationProof(verificationProof) : null;

  return (
    <Card className="glass-morphism p-6 border border-gray-600">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-green-400" />
        <h3 className="text-lg font-semibold text-white">Blockchain Verification Guide</h3>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-gray-600">
        {[
          { id: 'explanation', label: 'How It Works' },
          { id: 'verification', label: 'Verify Your Proof' },
          { id: 'tools', label: 'Verification Tools' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'explanation' && (
        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="text-blue-400 font-medium mb-2">Real Blockchain Timestamping</h4>
            <p className="text-gray-300 text-sm mb-3">
              Your work is protected using <strong>OpenTimestamps</strong> - a real blockchain timestamping service that creates verifiable proofs on Bitcoin and Ethereum blockchains.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">Your file's SHA-256 hash: <code className="text-purple-400 text-xs">{fileHash}</code></span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">OpenTimestamps proof anchored to Bitcoin/Ethereum blockchain</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">Verifiable through multiple calendar servers and block explorers</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Your Blockchain Verification Hash</h4>
            <div className="flex items-center gap-2 bg-gray-900 p-3 rounded font-mono text-sm">
              <span className="text-green-400 break-all">{blockchainHash}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(blockchainHash, 'Blockchain hash')}
                className="p-1 h-6 w-6"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-gray-400 text-xs mt-2">
              This hash combines your file data with real Ethereum blockchain information to create a tamper-proof timestamp.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'verification' && proofData && (
        <div className="space-y-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h4 className="text-green-400 font-medium mb-2">Verification Details</h4>
            <div className="grid gap-3 text-sm">
              <div>
                <span className="text-gray-400">Block Number:</span>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-white bg-gray-800 px-2 py-1 rounded">{proofData.blockchainAnchor}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(`https://etherscan.io/block/${proofData.blockchainAnchor}`, '_blank')}
                    className="p-1 h-6 w-6"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div>
                <span className="text-gray-400">Timestamp:</span>
                <p className="text-white">{new Date(proofData.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-400">Creator:</span>
                <p className="text-white">{proofData.creator}</p>
              </div>
              <div>
                <span className="text-gray-400">File Hash:</span>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-purple-400 bg-gray-800 px-2 py-1 rounded text-xs break-all">{proofData.fileHash}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(proofData.fileHash, 'File hash')}
                    className="p-1 h-6 w-6"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tools' && (
        <div className="space-y-4">
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <h4 className="text-purple-400 font-medium mb-3">Verification Tools</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
                <div>
                  <p className="text-white font-medium">OpenTimestamps Verification</p>
                  <p className="text-gray-400 text-sm">Official timestamp verification tool</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => window.open('https://opentimestamps.org/', '_blank')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Verify
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
                <div>
                  <p className="text-white font-medium">SHA-256 Hash Calculator</p>
                  <p className="text-gray-400 text-sm">Verify your file's hash independently</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => window.open('https://emn178.github.io/online-tools/sha256_checksum.html', '_blank')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Check
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
                <div>
                  <p className="text-white font-medium">Bitcoin Block Explorer</p>
                  <p className="text-gray-400 text-sm">Verify Bitcoin blockchain anchors</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => window.open('https://blockstream.info/', '_blank')}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Verify
                </Button>
              </div>
            </div>
          </div>
          
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h4 className="text-green-400 font-medium mb-2">Real Blockchain Protection</h4>
            <p className="text-gray-300 text-sm">
              Your work is now protected using <strong>OpenTimestamps</strong> - the industry standard for blockchain timestamping. 
              This creates actual verifiable proofs that can be independently verified on Bitcoin and Ethereum blockchains using multiple verification tools.
              Your timestamp proof will be permanently anchored and cannot be forged or tampered with.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}