export type VisitStatus = "scheduled" | "completed" | "missed" | "follow_up";

export type InterestLevel = "low" | "medium" | "high";

export type Sentiment = "positive" | "neutral" | "negative";

export interface Hospital {
  id: number;
  name: string;
  city: string;
  state?: string;
}

export interface Product {
  id: number;
  name: string;
  therapeuticArea: string;
}

export interface Doctor {
  id: number;
  fullName: string;
  specialization: string;
  city: string;
  hospital: Hospital;
  email?: string;
  phone?: string;
  lastVisitAt?: string;
  nextFollowUpAt?: string;
  productsPrescribed: Product[];
}

export interface InteractionFormValues {
  doctorId: number;
  hospitalId: number;
  meetingDate: string;
  meetingTime: string;
  durationMinutes: number;
  purpose: string;
  discussion: string;
  productsDiscussed: string[];
  samplesProvided: string;
  doctorFeedback: string;
  interestLevel: InterestLevel;
  competitorMentioned: string;
  nextFollowUp: string;
  additionalNotes: string;
  visitStatus: VisitStatus;
}

export interface Interaction extends InteractionFormValues {
  id: number;
  doctorName: string;
  hospitalName: string;
  summary: string;
  sentiment: Sentiment;
  actionItems: string[];
  confidenceScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "representative" | "assistant";
  content: string;
  createdAt: string;
}

export interface AIExtraction {
  doctorName: string;
  hospital: string;
  products: string[];
  summary: string;
  sentiment: Sentiment;
  actionItems: string[];
  followUpDate: string;
  keywords: string[];
  medicalEntities: string[];
  confidenceScore: number;
}

export interface AgentProcessResult {
  extraction: AIExtraction;
  response: string;
  selectedTool: string;
  formPatch: Record<string, unknown>;
  toolResults: Record<string, unknown>;
  savedInteractionId?: number | null;
  logs: Array<Record<string, unknown>>;
}

export interface AgentProcessPayload {
  message: string;
  doctorId?: number;
  interactionId?: number;
  saveRequested?: boolean;
}

export interface DashboardSummary {
  todaysVisits: number;
  upcomingMeetings: number;
  recentInteractions: Interaction[];
  pendingFollowUps: number;
  completionRate: number;
  averageConfidence: number;
}

export interface ApiError {
  message: string;
  status?: number;
}
