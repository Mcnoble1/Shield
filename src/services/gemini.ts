import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function analyzeEmail(emailData: EmailData): Promise<ScanResult> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `
    Analyze this email for phishing indicators:
    From: ${emailData.sender}
    Subject: ${emailData.subject}
    Content: ${emailData.content}
    Links: ${emailData.links.join(', ')}
    Attachments: ${emailData.attachments.join(', ')}

    Provide a detailed analysis including:
    1. Is this likely a phishing attempt?
    2. Confidence level (0-100)
    3. Explanation of findings
    4. Security recommendations
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  // Parse the AI response and structure it
  // This is a simplified example - in production you'd want more robust parsing
  return {
    isPhishing: text.toLowerCase().includes('phishing'),
    confidence: 85, // You'd extract this from the AI response
    explanation: text.split('\n')[0],
    recommendations: text.split('\n').slice(1)
  };
}

export async function analyzeWorkload(workloadData: WorkloadData): Promise<ScanResult> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `
    Analyze this cloud workload for security threats:
    IP: ${workloadData.ipAddress}
    Domain: ${workloadData.domain}
    Traffic Pattern: ${workloadData.trafficPattern}
    Payload: ${workloadData.payload}

    Provide a security analysis including:
    1. Is this likely a threat?
    2. Confidence level (0-100)
    3. Detailed explanation
    4. Mitigation recommendations
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  return {
    isPhishing: text.toLowerCase().includes('threat'),
    confidence: 90,
    explanation: text.split('\n')[0],
    recommendations: text.split('\n').slice(1)
  };
}