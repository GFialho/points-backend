import { handler } from "../functions/api/addPoints"; // Replace with the actual file path
import { APIGatewayEvent } from "aws-lambda";

jest.mock("../utils/database", () => ({
  getConnection: () => {
    return {
      user: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
    };
  },
}));

jest.mock("ethers", () => ({
  ethers: {
    verifyMessage: () => {
      return "testAddress";
    },
  },
}));

describe("handler", () => {
  let mockEvent: APIGatewayEvent;

  beforeEach(() => {
    mockEvent = {
      pathParameters: {
        address: "testAddress",
      },
      body: "{}",
      headers: { Authorization: "0x0000" },
    } as unknown as APIGatewayEvent;
  });

  it("should return a 401 response when address is not provided", async () => {
    mockEvent.pathParameters!.address = undefined;

    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(401);
  });

  it("should return a 403 response when body is not provided", async () => {
    mockEvent.pathParameters!.address = undefined;
    mockEvent.body = null;
    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(401);
  });

  it("should return a 201 response with the user data when address is provided", async () => {
    const response = await handler(mockEvent);
    expect(response.statusCode).toBe(201);
  });
});
