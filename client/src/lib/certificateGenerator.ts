import jsPDF from 'jspdf';
import QRCode from 'qrcode';

interface CertificateData {
  certificateId: string;
  title: string;
  description: string;
  creatorName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  fileHash: string;
  blockchainHash: string;
  createdAt: string;
  shareableLink: string;
  verificationProof?: {
    bitcoin?: {
      otsProof?: string;
      otsFilename?: string;
      verificationStatus?: string;
      verificationUrl?: string;
      blockHeight?: number;
      instructions?: string;
    };
    ethereum?: {
      success?: boolean;
      transactionHash?: string;
      blockNumber?: number;
      blockHash?: string;
      verificationUrl?: string;
      anchorType?: string;
      instructions?: string;
    };
    isRealBlockchain?: boolean;
    hasImmediateVerification?: boolean;
    hasBitcoinTimestamp?: boolean;
    dualAnchorComplete?: boolean;
    verificationUrls?: string[];
  };
}

export async function generateCertificatePDF(data: CertificateData): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Colors matching website theme - Pink: #FE3F5E, Yellow: #FFD200
  
  // Gradient Header Background
  pdf.setFillColor(254, 63, 94); // Primary pink
  pdf.rect(0, 0, pageWidth, 50, 'F');
  
  // Add a subtle secondary stripe
  pdf.setFillColor(255, 210, 0); // Yellow
  pdf.rect(0, 45, pageWidth, 5, 'F');
  
  // Header Text
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.text('LOGGIN\' CERTIFICATE', pageWidth / 2, 22, { align: 'center' });
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Digital Asset Protection & Blockchain Verification', pageWidth / 2, 35, { align: 'center' });
  
  // Reset text color to match website theme
  pdf.setTextColor(31, 41, 55); // Dark gray from website
  
  // Certificate ID Section with better spacing
  let currentY = 70;
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Certificate ID', pageWidth / 2, currentY, { align: 'center' });
  
  // Certificate ID in box with pink accent
  currentY += 15;
  pdf.setFillColor(254, 63, 94, 0.1); // Light pink background
  pdf.setDrawColor(254, 63, 94); // Pink border
  pdf.rect(20, currentY - 5, pageWidth - 40, 12, 'FD');
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(254, 63, 94); // Pink text
  pdf.text(data.certificateId, pageWidth / 2, currentY + 4, { align: 'center' });
  
  // Work Information Section with improved layout
  currentY += 30;
  pdf.setTextColor(31, 41, 55);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Protected Work Details', pageWidth / 2, currentY, { align: 'center' });
  
  // Draw elegant line under heading
  currentY += 5;
  pdf.setDrawColor(254, 63, 94);
  pdf.setLineWidth(0.5);
  pdf.line(pageWidth / 2 - 40, currentY, pageWidth / 2 + 40, currentY);
  
  // Work details in organized card-like format
  currentY += 15;
  
  // Create info boxes for better organization
  const createInfoBox = (label: string, value: string, y: number) => {
    pdf.setFillColor(248, 250, 252); // Light gray background
    pdf.setDrawColor(229, 231, 235); // Gray border
    pdf.rect(30, y - 3, pageWidth - 60, 10, 'FD');
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(107, 114, 128); // Gray label
    pdf.text(label, 35, y + 2);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(31, 41, 55); // Dark text
    pdf.text(value, 35, y + 6);
    
    return y + 15;
  };
  
  currentY = createInfoBox('Title', data.title, currentY);
  currentY = createInfoBox('Creator', data.creatorName, currentY);
  currentY = createInfoBox('File Name', data.originalName, currentY);
  currentY = createInfoBox('File Type', data.mimeType, currentY);
  currentY = createInfoBox('File Size', formatFileSize(data.fileSize), currentY);
  currentY = createInfoBox('Protection Date', formatDate(data.createdAt), currentY);
  
  // Description (if provided)
  if (data.description) {
    currentY += 5;
    currentY = createInfoBox('Description', data.description, currentY);
  }
  
  // Blockchain Verification Section
  currentY += 20;
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(31, 41, 55);
  pdf.text('Blockchain Verification', pageWidth / 2, currentY, { align: 'center' });
  
  // Draw elegant line under heading
  currentY += 5;
  pdf.setDrawColor(254, 63, 94);
  pdf.setLineWidth(0.5);
  pdf.line(pageWidth / 2 - 40, currentY, pageWidth / 2 + 40, currentY);
  
  // File Hash in prominent box
  currentY += 15;
  pdf.setFillColor(248, 250, 252); // Light background
  pdf.setDrawColor(107, 114, 128); // Gray border
  pdf.rect(20, currentY - 5, pageWidth - 40, 20, 'FD');
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(107, 114, 128);
  pdf.text('File Hash (SHA-256):', 25, currentY + 2);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(31, 41, 55);
  const hashLines = pdf.splitTextToSize(data.fileHash, pageWidth - 50);
  pdf.text(hashLines, 25, currentY + 8);
  
  currentY += 25;
  
  // Bitcoin Blockchain Section
  if (data.verificationProof?.bitcoin && data.verificationProof.hasBitcoinTimestamp) {
    // Bitcoin section box
    pdf.setFillColor(255, 248, 235); // Light orange background
    pdf.setDrawColor(255, 140, 0); // Orange border
    pdf.rect(20, currentY - 5, pageWidth - 40, 25, 'FD');
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 140, 0); // Bitcoin orange
    pdf.text('₿ Bitcoin Blockchain (OpenTimestamps)', 25, currentY + 2);
    
    const btcStatus = data.verificationProof.bitcoin.verificationStatus === 'pending' ? 'Pending (1-6 hours)' : 'Confirmed';
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(120, 53, 15); // Dark orange
    pdf.text(`Status: ${btcStatus}`, 25, currentY + 8);
    
    if (data.verificationProof.bitcoin.blockHeight) {
      pdf.text(`Block Height: ${data.verificationProof.bitcoin.blockHeight}`, 25, currentY + 12);
    }
    
    if (data.verificationProof.bitcoin.otsFilename) {
      pdf.text(`OTS File: ${data.verificationProof.bitcoin.otsFilename}`, 25, currentY + 16);
    }
    
    pdf.text('Verify: https://opentimestamps.org', 25, currentY + 20);
    currentY += 30;
  }
  
  // Ethereum Blockchain Section
  if (data.verificationProof?.ethereum && data.verificationProof.ethereum.success) {
    // Ethereum section box
    pdf.setFillColor(236, 240, 255); // Light blue background
    pdf.setDrawColor(99, 102, 241); // Blue border
    pdf.rect(20, currentY - 5, pageWidth - 40, 25, 'FD');
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(99, 102, 241); // Ethereum blue
    pdf.text('⟠ Ethereum Blockchain', 25, currentY + 2);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(55, 65, 81);
    
    if (data.verificationProof.ethereum.transactionHash) {
      pdf.text('Type: Transaction Anchor', 25, currentY + 8);
      pdf.text(`Tx Hash: ${data.verificationProof.ethereum.transactionHash.substring(0, 20)}...`, 25, currentY + 12);
    } else {
      pdf.text('Type: Block Reference Anchor', 25, currentY + 8);
    }
    
    if (data.verificationProof.ethereum.blockNumber) {
      pdf.text(`Block: ${data.verificationProof.ethereum.blockNumber}`, 25, currentY + 16);
    }
    
    pdf.text('Status: Confirmed', 25, currentY + 20);
    currentY += 30;
  }
  
  // Verification Summary
  currentY += 15;
  pdf.setFillColor(240, 253, 244); // Light green background
  pdf.setDrawColor(34, 197, 94); // Green border
  pdf.rect(20, currentY - 5, pageWidth - 40, 15, 'FD');
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  
  if (data.verificationProof?.isRealBlockchain) {
    if (data.verificationProof.dualAnchorComplete) {
      pdf.setTextColor(22, 163, 74); // Green
      pdf.text('✓ DUAL BLOCKCHAIN VERIFICATION COMPLETE', 25, currentY + 4);
    } else if (data.verificationProof.hasImmediateVerification) {
      pdf.setTextColor(22, 163, 74); // Green  
      pdf.text('✓ ETHEREUM VERIFIED - Bitcoin pending', 25, currentY + 4);
    } else {
      pdf.setTextColor(217, 119, 6); // Orange
      pdf.text('⏳ Blockchain verification in progress', 25, currentY + 4);
    }
  } else {
    pdf.setTextColor(107, 114, 128); // Gray
    pdf.text('⚠ Limited blockchain verification', 25, currentY + 4);
  }
  
  currentY += 20;
  
  // QR Code Section positioned properly
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(data.shareableLink, {
      width: 200,
      margin: 2,
      color: {
        dark: '#FE3F5E', // Pink QR code to match theme
        light: '#FFFFFF'
      }
    });
    
    // Position QR code on the right side with current Y position
    const qrSize = 35;
    const qrX = pageWidth - qrSize - 25;
    
    pdf.addImage(qrCodeDataUrl, 'PNG', qrX, currentY, qrSize, qrSize);
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 41, 55);
    pdf.text('Scan to verify online', qrX + qrSize/2, currentY + qrSize + 8, { align: 'center' });
    
    currentY += qrSize + 15;
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    currentY += 20;
  }
  
  // Professional Footer with theme colors
  const footerY = pageHeight - 40;
  
  // Footer background stripe
  pdf.setFillColor(254, 63, 94); // Pink background
  pdf.rect(0, footerY - 5, pageWidth, 45, 'F');
  
  // Footer content
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('LOGGIN\' - Digital Asset Protection Platform', pageWidth / 2, footerY + 5, { align: 'center' });
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, pageWidth / 2, footerY + 15, { align: 'center' });
  
  // Verification URL in contrasting color
  pdf.setTextColor(255, 210, 0); // Yellow accent
  pdf.setFont('helvetica', 'bold');
  const shortUrl = data.shareableLink.replace('https://', '').substring(0, 60) + '...';
  pdf.text(`Verify online: ${shortUrl}`, pageWidth / 2, footerY + 25, { align: 'center' });
  
  // Download the PDF
  pdf.save(`certificate-${data.certificateId}.pdf`);
}

function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}