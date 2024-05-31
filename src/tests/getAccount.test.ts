import { handler } from "../functions/api/createProject"; // Replace with the actual file path
import { APIGatewayEvent } from "aws-lambda";

jest.mock("../utils/database", () => ({
  getConnection: () => {
    return {
      user: {
        findUnique: jest.fn(),
      },
    };
  },
}));

describe("handler", () => {
  let mockEvent: APIGatewayEvent;
  let mockPrisma: any;

  beforeEach(() => {
    mockEvent = {
      pathParameters: {
        address: "testAddress",
      },
    } as unknown as APIGatewayEvent;

    mockPrisma = {
      user: {
        findUnique: jest.fn(),
      },
    };
  });

  it("should return a 401 response when address is not provided", async () => {
    mockEvent.pathParameters!.address = undefined;

    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(401);
  });

  it("should return a 200 response with the user data when address is provided", async () => {
    const mockUser = {
      id: 1,
      name: "Test User",
    };

    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    const response = await handler(mockEvent);
    expect(response.statusCode).toBe(200);
  });
});
