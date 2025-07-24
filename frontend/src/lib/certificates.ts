export function generateCertificateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PRF-${new Date().getFullYear()}-${timestamp}-${random}`;
}

export function generateQRCodeSVG(data: string): string {
  // Simple QR code placeholder - in production, use a proper QR code library
  const encoded = encodeURIComponent(data);
  return `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="white"/>
      <rect x="20" y="20" width="160" height="160" fill="black" opacity="0.1"/>
      <text x="100" y="90" text-anchor="middle" font-family="monospace" font-size="8" fill="black">
        ${data.substring(0, 20)}...
      </text>
      <text x="100" y="110" text-anchor="middle" font-family="monospace" font-size="6" fill="gray">
        Scan for verification
      </text>
    </svg>
  `)}`;
}

export function formatFileSize(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
}

export function getFileTypeDisplay(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "Image";
  if (mimeType.startsWith("audio/")) return "Audio";
  if (mimeType.includes("pdf")) return "PDF Document";
  if (mimeType.includes("doc")) return "Document";
  return "File";
}

export function generateShareableLink(certificateId: string, baseUrl?: string): string {
  const base = baseUrl || window.location.origin;
  return `${base}/certificate/${certificateId}`;
}
