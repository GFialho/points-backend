import { APIGatewayEvent } from "aws-lambda";
import { apiResponse } from "../../utils/api";
import { getConnection } from "../../utils/database";

export const handler = async (event: APIGatewayEvent) => {
  const { eventName } = event.queryStringParameters as unknown as {
    address: string;
    eventName?: string;
  };
  const { address } = event.pathParameters as unknown as { address: string };

  if (!address) return apiResponse(401, { message: "Address is required" });

  const prisma = getConnection();

  const { projectId } = event.requestContext.authorizer as any;

  const user = await prisma.user.findUnique({
    where: { projectId_address: { projectId, address } },
  });

  if (!user) return apiResponse(200, { balance: 0 });

  let totalUserBalance: number | undefined | null;

  if (eventName) {
    const balance = await prisma.balance.findUnique({
      where: { userId_eventName: { userId: user.id, eventName } },
    });
    totalUserBalance = balance?.amount;
  } else {
    const balance = await prisma.balance.aggregate({
      _sum: { amount: true },
      where: { userId: user.id },
    });

    totalUserBalance = balance?._sum?.amount;
  }

  return apiResponse(200, { balance: totalUserBalance || 0 });
};
