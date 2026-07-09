import { z } from "zod";

export const interactionSchema = z.object({
  doctorId: z.coerce.number().min(1, "Doctor is required"),
  hospitalId: z.coerce.number().min(1, "Hospital is required"),
  meetingDate: z.string().min(1, "Meeting date is required"),
  meetingTime: z.string().min(1, "Meeting time is required"),
  durationMinutes: z.coerce.number().min(5).max(240),
  purpose: z.string().min(1, "Purpose is required"),
  discussion: z.string().min(20, "Add a meaningful discussion summary"),
  productsDiscussed: z.array(z.string()).min(1, "Select at least one product"),
  samplesProvided: z.string().optional().default(""),
  doctorFeedback: z.string().optional().default(""),
  interestLevel: z.enum(["low", "medium", "high"]),
  competitorMentioned: z.string().optional().default(""),
  nextFollowUp: z.string().optional().default(""),
  additionalNotes: z.string().optional().default(""),
  visitStatus: z.enum(["scheduled", "completed", "missed", "follow_up"]),
});

export type InteractionSchema = z.infer<typeof interactionSchema>;
