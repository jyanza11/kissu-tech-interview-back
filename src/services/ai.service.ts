import OpenAI from "openai";
import { prisma } from "../lib/prisma";

type EventData = {
  title: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
};

type AIAnalysis = {
  summary: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  action: string;
};

// Mock AI responses for development
const mockResponses = {
  summary: [
    "This event indicates a potential system issue that requires monitoring.",
    "A security-related incident has been detected that needs immediate attention.",
    "Performance degradation observed in critical system components.",
    "Service availability is impacted and requires investigation.",
  ],
  severity: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const,
  action: [
    "Monitor the situation and check system logs for additional context.",
    "Investigate the root cause and implement temporary mitigation measures.",
    "Escalate to the on-call engineer and prepare incident response procedures.",
    "Activate emergency response protocol and notify all stakeholders immediately.",
  ],
};

class MockAIAdapter {
  async analyzeEvent(event: EventData): Promise<AIAnalysis> {
    // Simulate processing delay
    await new Promise((resolve) =>
      setTimeout(resolve, 500 + Math.random() * 1000)
    );

    const summaryIndex = Math.floor(
      Math.random() * mockResponses.summary.length
    );
    const severityIndex = Math.floor(
      Math.random() * mockResponses.severity.length
    );
    const actionIndex = Math.floor(Math.random() * mockResponses.action.length);

    return {
      summary: mockResponses.summary[summaryIndex] || "Analysis completed",
      severity: mockResponses.severity[severityIndex] || "MEDIUM",
      action: mockResponses.action[actionIndex] || "Monitor the situation",
    };
  }
}

class OpenAIAdapter {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async analyzeEvent(event: EventData): Promise<AIAnalysis> {
    const prompt = `
Analyze the following system event and provide:
1. A concise summary (1-2 sentences)
2. Severity assessment (LOW, MEDIUM, HIGH, CRITICAL)
3. Recommended next action (1-2 sentences)

Event:
Title: ${event.title}
Description: ${event.description}
Current Severity: ${event.severity}

Respond in JSON format:
{
  "summary": "string",
  "severity": "LOW|MEDIUM|HIGH|CRITICAL",
  "action": "string"
}
`;

    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 300,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("No response from OpenAI");

      const parsed = JSON.parse(content);
      return {
        summary: parsed.summary || "Analysis completed",
        severity: parsed.severity || "MEDIUM",
        action: parsed.action || "Monitor the situation",
      };
    } catch (error) {
      // Log the specific error for debugging
      if (error instanceof Error) {
        console.error("OpenAI API error:", {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
      } else {
        console.error("OpenAI API error:", error);
      }

      // Re-throw the error to be caught by the fallback mechanism
      throw error;
    }
  }
}

// AI Service with adapter pattern and fallback mechanism
export class AIService {
  private primaryAdapter: MockAIAdapter | OpenAIAdapter;
  private fallbackAdapter: MockAIAdapter;

  constructor() {
    const provider = process.env.AI_PROVIDER || "mock";
    const apiKey = process.env.OPENAI_API_KEY;

    // Always create a mock adapter as fallback
    this.fallbackAdapter = new MockAIAdapter();

    if (provider === "openai" && apiKey) {
      this.primaryAdapter = new OpenAIAdapter(apiKey);
    } else {
      this.primaryAdapter = this.fallbackAdapter;
    }
  }

  async analyzeEvent(eventId: string): Promise<AIAnalysis> {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error("Event not found");
    }

    const eventData = {
      title: event.title,
      description: event.description,
      severity: event.severity,
    };

    let analysis: AIAnalysis;
    let usedFallback = false;

    try {
      // Try primary adapter first
      analysis = await this.primaryAdapter.analyzeEvent(eventData);
    } catch (error) {
      console.warn(
        "Primary AI adapter failed, falling back to mock adapter:",
        error
      );
      usedFallback = true;

      // Fall back to mock adapter
      analysis = await this.fallbackAdapter.analyzeEvent(eventData);
    }

    // Store analysis in database with fallback indicator
    await prisma.aIAnalysis.create({
      data: {
        eventId: event.id,
        summary: analysis.summary,
        severity: analysis.severity,
        action: analysis.action,
        // Add a note if fallback was used
        ...(usedFallback && {
          summary: `${analysis.summary} [Generated using fallback AI due to primary service unavailability or credits exhausted]`,
        }),
      },
    });

    return analysis;
  }

  async getEventAnalysis(eventId: string) {
    return prisma.aIAnalysis.findMany({
      where: { eventId },
      orderBy: { createdAt: "desc" },
      include: { event: true },
    });
  }
}

export const aiService = new AIService();
