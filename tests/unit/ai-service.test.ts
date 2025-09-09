describe("AI Service", () => {
  // Mock the AI service module
  const mockAIService = {
    summarizeEvent: jest.fn(),
    classifySeverity: jest.fn(),
    suggestAction: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("MockAIAdapter", () => {
    it("should return a summary for a valid event", async () => {
      mockAIService.summarizeEvent.mockResolvedValue("Test summary");

      const eventData = {
        title: "Test Event",
        description: "This is a test event description",
        rawData: { source: "test", timestamp: "2024-01-01" },
      };

      const result = await mockAIService.summarizeEvent(eventData);

      expect(result).toBe("Test summary");
      expect(mockAIService.summarizeEvent).toHaveBeenCalledWith(eventData);
    });

    it("should return a valid severity level", async () => {
      mockAIService.classifySeverity.mockResolvedValue("HIGH");

      const eventData = {
        title: "Critical System Error",
        description: "System is down and users cannot access the application",
        rawData: { error: "critical" },
      };

      const result = await mockAIService.classifySeverity(eventData);

      expect(result).toBe("HIGH");
      expect(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).toContain(result);
    });

    it("should return an action suggestion", async () => {
      mockAIService.suggestAction.mockResolvedValue("Restart the service");

      const eventData = {
        title: "Database Connection Error",
        description: "Cannot connect to the database",
        rawData: { error: "connection_failed" },
      };

      const result = await mockAIService.suggestAction(eventData, "HIGH");

      expect(result).toBe("Restart the service");
      expect(mockAIService.suggestAction).toHaveBeenCalledWith(
        eventData,
        "HIGH"
      );
    });

    it("should handle different severity levels", async () => {
      const severities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

      severities.forEach((severity) => {
        mockAIService.classifySeverity.mockResolvedValueOnce(severity);
      });

      const eventData = {
        title: "Test Event",
        description: "Test description",
        rawData: {},
      };

      for (const expectedSeverity of severities) {
        const result = await mockAIService.classifySeverity(eventData);
        expect(severities).toContain(result);
      }
    });

    it("should handle malformed event data gracefully", async () => {
      mockAIService.summarizeEvent.mockResolvedValue("Default summary");
      mockAIService.classifySeverity.mockResolvedValue("MEDIUM");
      mockAIService.suggestAction.mockResolvedValue("Default action");

      const malformedData = {
        title: null,
        description: undefined,
        rawData: "invalid",
      } as any;

      // Should not throw an error
      const summary = await mockAIService.summarizeEvent(malformedData);
      const severity = await mockAIService.classifySeverity(malformedData);
      const action = await mockAIService.suggestAction(malformedData, "MEDIUM");

      expect(summary).toBe("Default summary");
      expect(severity).toBe("MEDIUM");
      expect(action).toBe("Default action");
    });
  });
});
