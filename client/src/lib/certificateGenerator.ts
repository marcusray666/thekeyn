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
}

export async function generateCertificatePDF(data: CertificateData): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Colors
  const primaryColor = '#6366f1'; // Indigo
  const darkGray = '#374151';
  const lightGray = '#9ca3af';
  
  // Header Background
  pdf.setFillColor(99, 102, 241); // Indigo
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  // Header Text
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CERTIFICATE OF AUTHENTICITY', pageWidth / 2, 20, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Blockchain-Verified Digital Asset Protection', pageWidth / 2, 30, { align: 'center' });
  
  // Reset text color
  pdf.setTextColor(55, 65, 81); // Dark gray
  
  // Certificate ID Section
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Certificate ID:', 20, 60);
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(99, 102, 241); // Indigo
  pdf.text(data.certificateId, 20, 70);
  
  // Work Information Section
  pdf.setTextColor(55, 65, 81);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Work Information', 20, 90);
  
  // Draw line under heading
  pdf.setDrawColor(156, 163, 175);
  pdf.line(20, 95, pageWidth - 20, 95);
  
  const leftColumn = 20;
  const rightColumn = 110;
  let yPos = 110;
  
  // Work details
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Title:', leftColumn, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.title, leftColumn + 25, yPos);
  
  yPos += 10;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Creator:', leftColumn, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.creatorName, leftColumn + 25, yPos);
  
  yPos += 10;
  pdf.setFont('helvetica', 'bold');
  pdf.text('File Name:', leftColumn, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.originalName, leftColumn + 25, yPos);
  
  yPos += 10;
  pdf.setFont('helvetica', 'bold');
  pdf.text('File Type:', leftColumn, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.mimeType, leftColumn + 25, yPos);
  
  yPos += 10;
  pdf.setFont('helvetica', 'bold');
  pdf.text('File Size:', leftColumn, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(formatFileSize(data.fileSize), leftColumn + 25, yPos);
  
  yPos += 10;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Created:', leftColumn, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(formatDate(data.createdAt), leftColumn + 25, yPos);
  
  // Description (if provided)
  if (data.description) {
    yPos += 20;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Description:', leftColumn, yPos);
    yPos += 7;
    pdf.setFont('helvetica', 'normal');
    
    // Split long descriptions
    const splitDescription = pdf.splitTextToSize(data.description, pageWidth - 40);
    pdf.text(splitDescription, leftColumn, yPos);
    yPos += splitDescription.length * 5;
  }
  
  // Verification Section
  yPos += 20;
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Blockchain Verification', leftColumn, yPos);
  
  pdf.setDrawColor(156, 163, 175);
  pdf.line(20, yPos + 5, pageWidth - 20, yPos + 5);
  
  yPos += 20;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('File Hash (SHA-256):', leftColumn, yPos);
  yPos += 7;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(data.fileHash, leftColumn, yPos);
  
  yPos += 15;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Blockchain Hash:', leftColumn, yPos);
  yPos += 7;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(data.blockchainHash, leftColumn, yPos);
  
  // QR Code Section
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(data.shareableLink, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    // Position QR code on the right side
    const qrSize = 40;
    const qrX = pageWidth - qrSize - 20;
    const qrY = 110;
    
    pdf.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Scan to verify online', qrX + qrSize/2, qrY + qrSize + 8, { align: 'center' });
  } catch (error) {
    console.error('Failed to generate QR code:', error);
  }
  
  // Footer
  const footerY = pageHeight - 30;
  pdf.setDrawColor(156, 163, 175);
  pdf.line(20, footerY, pageWidth - 20, footerY);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(156, 163, 175);
  pdf.text('This certificate was generated by Loggin - Digital Asset Protection Platform', pageWidth / 2, footerY + 10, { align: 'center' });
  pdf.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, pageWidth / 2, footerY + 18, { align: 'center' });
  
  // Verification URL
  pdf.setTextColor(99, 102, 241);
  pdf.text(`Verify online: ${data.shareableLink}`, pageWidth / 2, footerY + 26, { align: 'center' });
  
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