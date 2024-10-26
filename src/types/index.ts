export interface ScanResult {
  isPhishing: boolean;
  confidence: number;
  explanation: string;
  recommendations: string[];
}

export interface EmailData {
  sender: string;
  subject: string;
  content: string;
  links: string[];
  attachments: string[];
}

export interface WorkloadData {
  ipAddress: string;
  domain: string;
  trafficPattern: string;
  payload: string;
}