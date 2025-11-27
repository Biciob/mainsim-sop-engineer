
export interface Asset {
  id: string;
  name: string;
  brand: string;
  model: string;
}

export interface SopRecord {
  id: string;
  assetId?: string; // Optional linkage to an asset
  title: string;
  content: string; // Markdown content
  createdAt: number;
  // Metadata fields
  description: string;
  brand: string;
  model: string;
  specs: string;
  type?: 'standard' | 'technical_sheet' | 'instruction';
}

export interface SopGenerationRequest {
  description: string;
  brand: string;
  model: string;
  specs: string;
  docType?: string;
}
