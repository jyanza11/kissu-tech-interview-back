import { prisma } from "../lib/prisma";
import { aiService } from "./ai.service";

export async function listEvents() {
  return prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    include: { analyses: true },
  });
}

export async function simulateEvent(input: {
  title: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}) {
  const event = await prisma.event.create({
    data: input,
    include: { analyses: true },
  });

  // Trigger AI analysis in background
  aiService.analyzeEvent(event.id).catch((error) => {
    console.error("AI analysis failed for event", event.id, error);
  });

  return event;
}

export async function getEventAnalysis(eventId: string) {
  return aiService.getEventAnalysis(eventId);
}

export async function triggerAIAnalysis(eventId: string) {
  return aiService.analyzeEvent(eventId);
}
