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
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-green-500 dark:text-green-400" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Blockchain Verification Guide</h3>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-gray-300 dark:border-gray-600">
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
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'explanation' && (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 rounded-lg p-4">
            <h4 className="text-blue-700 dark:text-blue-400 font-bold mb-2">Real Blockchain Timestamping</h4>
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
              Your work is protected using <strong className="text-blue-600 dark:text-blue-400">OpenTimestamps</strong> - a real blockchain timestamping service that creates verifiable proofs on Bitcoin and Ethereum blockchains.
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Your file's SHA-256 hash:</span>
                  <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono break-all">
                    <span className="text-purple-700 dark:text-purple-400">{fileHash}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">OpenTimestamps proof anchored to Bitcoin/Ethereum blockchain</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">Verifiable through multiple calendar servers and block explorers</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <h4 className="text-gray-900 dark:text-white font-bold mb-3">Your Blockchain Verification Hash</h4>
            <div className="relative">
              <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-3 rounded font-mono text-xs break-all pr-10">
                <span className="text-green-600 dark:text-green-400">{blockchainHash}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(blockchainHash, 'Blockchain hash')}
                className="absolute top-2 right-2 p-1 h-6 w-6 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-xs mt-3 leading-relaxed">
              This hash combines your file data with real blockchain information to create a tamper-proof timestamp.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'verification' && proofData && (
        <div className="space-y-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h4 className="text-green-400 font-medium mb-4">Verification Details</h4>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-gray-400 block mb-2">OpenTimestamps Commitment:</span>
                <div className="relative">
                  <div className="text-white bg-gray-800 px-3 py-2 rounded font-mono text-xs break-all pr-10">{proofData.blockchainAnchor}</div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(proofData.blockchainAnchor, 'OpenTimestamps commitment')}
                    className="absolute top-1 right-1 p-1 h-6 w-6 hover:bg-gray-700"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-gray-500 text-xs mt-1">This commitment will be anchored to Bitcoin blockchain within 1-6 hours</p>
              </div>
              <div>
                <span className="text-gray-400 block mb-2">Timestamp Created:</span>
                <p className="text-white bg-gray-800 px-3 py-2 rounded">{new Date(proofData.timestamp).toLocaleString()}</p>
                <p className="text-gray-500 text-xs mt-1">When your file was first timestamped</p>
              </div>
              <div>
                <span className="text-gray-400 block mb-2">Verification Status:</span>
                <div className="bg-gray-800 px-3 py-2 rounded">
                  {proofData.isRealBlockchain ? (
                    <span className="text-green-400">✓ Anchored to blockchain - fully verifiable</span>
                  ) : (
                    <span className="text-yellow-400">⏳ Pending blockchain anchor (1-6 hours)</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-gray-400 block mb-2">Creator:</span>
                <p className="text-white bg-gray-800 px-3 py-2 rounded">{proofData.creator}</p>
              </div>
              <div>
                <span className="text-gray-400 block mb-2">File Hash:</span>
                <div className="relative">
                  <div className="text-purple-400 bg-gray-800 px-3 py-2 rounded font-mono text-xs break-all pr-10">{proofData.fileHash}</div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(proofData.fileHash, 'File hash')}
                    className="absolute top-1 right-1 p-1 h-6 w-6 hover:bg-gray-700"
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