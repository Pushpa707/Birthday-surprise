
export interface BirthdayProfile {
  recipientName: string;
  senderName: string;
  relationship: 'Crush' | 'Partner' | 'Best Friend' | 'Spouse';
  sharedMemories: string;
  tone: 'Romantic' | 'Emotional' | 'Futuristic' | 'Poetic';
  birthdayDate: string;
  customBackground?: string; // Base64 string for custom background
  memorialImage?: string; // Base64 string for a specific memory photo
  galleryImages: string[]; // Array of base64 strings for a memory gallery
  starDensity: number; // Number of stars in the background
}

export interface GeneratedMessage {
  title: string;
  body: string;
  closing: string;
  image1?: string;
  image2?: string;
}
