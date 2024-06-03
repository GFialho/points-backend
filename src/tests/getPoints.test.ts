import { handler } from "../functions/api/getPoints";
import { apiResponse } from "../utils/api";
let mockPrisma: any;

jest.mock("../utils/database", () => ({
  getConnection: () => {
    return mockPrisma;
  },
}));

describe("handler", () => {
  const mockEvent = {
    queryStringParameters: {
      eventName: "mockEventName",
    },
    pathParameters: {
      address: "mockAddress",
    },
    requestContext: {
      authorizer: {
        projectId: "mockProjectId",
      },
    },
  };

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
      },
      balance: {
        findUnique: jest.fn(),
        aggregate: jest.fn(),
      },
    };
  });

  it("should return 401 if address is missing", async () => {
    const result = await handler({
      ...mockEvent,
      pathParameters: {},
    } as any);

    expect(result).toEqual(
      apiResponse(401, { message: "Address is required" })
    );
  });

  it("should return user balance if user is found", async () => {
    const mockUser = {
      id: "mockUserId",
    };

    const mockBalance = {
      amount: 100,
    };

    mockPrisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(mockUser),
      },
      balance: {
        findUnique: jest.fn().mockResolvedValue(mockBalance),
        aggregate: jest.fn(),
      },
    };

    const result = await handler(mockEvent as any);

    expect(result).toEqual(apiResponse(200, { balance: mockBalance.amount }));
  });

  it("should return 0 balance if user is not found", async () => {
    mockPrisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      balance: {
        findUnique: jest.fn(),
        aggregate: jest.fn(),
      },
    };

    const result = await handler(mockEvent as any);

    expect(result).toEqual(apiResponse(200, { balance: 0 }));
  });

  it("should return 0 balance if user is found but no event name is provided", async () => {
    const mockUser = {
      id: "mockUserId",
    };

    mockPrisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(mockUser),
      },
      balance: {
        findUnique: jest.fn(),
        aggregate: jest.fn().mockResolvedValue({ _sum: { amount: null } }),
      },
    };

    const result = await handler(mockEvent as any);

    expect(result).toEqual(apiResponse(200, { balance: 0 }));
  });
});
