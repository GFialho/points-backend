import { handler } from "../functions/api/createProject";
import { apiResponse } from "../utils/api";
let mockPrisma: any;

jest.mock("@paralleldrive/cuid2", () => ({
  createId: jest.fn().mockReturnValue("mockId"),
}));

jest.mock("crypto", () => ({
  randomUUID: jest.fn().mockReturnValue("apikey-123"),
  createHash: () => {
    return {
      update: () => {
        return { digest: jest.fn };
      },
    };
  },
}));

jest.mock("../utils/database", () => ({
  getConnection: () => {
    return mockPrisma;
  },
}));

describe("handler", () => {
  const mockEvent = {
    body: JSON.stringify({ id: "mockId" }),
  };

  beforeEach(() => {
    mockPrisma = {
      project: {
        findUnique: jest.fn(),
      },
    };
  });

  it("should return 401 if body is missing", async () => {
    const result = await handler({} as any);

    expect(result).toEqual(
      apiResponse(401, { message: "Missing Body in the Request" })
    );
  });

  it("should create project and return id and apiKey", async () => {
    const mockCreate = jest.fn().mockResolvedValue({ id: "mockProjectId" });
    mockPrisma = {
      project: {
        create: mockCreate,
      },
    };

    const result = await handler(mockEvent as any);

    expect(result).toEqual(
      apiResponse(200, { id: "mockProjectId", apiKey: "apikey-123" })
    );
  });
});
