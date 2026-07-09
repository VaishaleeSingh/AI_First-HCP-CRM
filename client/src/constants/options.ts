import { Product } from "../types";

export const productCatalog: Product[] = [
  { id: 1, name: "GlucoZen XR", therapeuticArea: "Diabetes" },
  { id: 2, name: "CardiaPlus", therapeuticArea: "Cardiology" },
  { id: 3, name: "RespiraClear", therapeuticArea: "Pulmonology" },
  { id: 4, name: "NeuroCalm", therapeuticArea: "Neurology" },
  { id: 5, name: "Immunova", therapeuticArea: "Immunology" },
];

export const visitPurposeOptions = [
  "AI-assisted HCP interaction",
  "Clinical update",
  "New trial discussion",
  "Product education",
  "Sample request",
  "Follow-up visit",
  "Adverse event discussion",
];

export const interestLevelOptions = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

export const visitStatusOptions = [
  { label: "Scheduled", value: "scheduled" },
  { label: "Completed", value: "completed" },
  { label: "Missed", value: "missed" },
  { label: "Follow-up", value: "follow_up" },
];
