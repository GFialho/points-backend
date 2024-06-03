import { handler } from "../functions/auth/authorizer";
let mockPrisma: any;

jest.mock("../utils/database", () => ({
  getConnection: () => {
    return mockPrisma;
  },
}));

describe("handler", () => {
  const mockEvent = {
    authorizationToken: "mockToken",
  };

  const mockProject = {
    id: "mockProjectId",
  };

  beforeEach(() => {
    mockPrisma = {
      project: {
        findUnique: jest.fn(),
      },
    };
  });

  it("should deny access if project is not found", async () => {
    mockPrisma.project.findUnique.mockResolvedValue(null);

    const result = await handler(mockEvent as any);

    expect(result.principalId).toBe("user");
    expect(result.policyDocument.Statement[0].Effect).toBe("Deny");
  });

  it("should allow access if project is found", async () => {
    mockPrisma.project.findUnique.mockResolvedValue(mockProject);

    const result = await handler(mockEvent as any);

    expect(result.principalId).toBe("user");
    expect(result.policyDocument.Statement[0].Effect).toBe("Allow");
    expect(result?.context?.projectId).toBe(mockProject.id);
  });
});
