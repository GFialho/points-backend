import { APIGatewayEvent } from "aws-lambda";
import { apiResponse } from "../../utils/api";
import { getConnection } from "../../utils/database";

export const handler = async (event: APIGatewayEvent) => {
  if (!event.body)
    return apiResponse(401, { message: "Missing Body in the Request" });

  const { points, eventName } = JSON.parse(event.body);
  const { address } = event.pathParameters as unknown as { address: string };

  if (!points) return apiResponse(401, { message: "Points is required" });

  const prisma = getConnection();

  const { projectId } = event.requestContext.authorizer as any;

  const user = await prisma.user.findUnique({
    where: { projectId_address: { projectId, address } },
    include: { balance: { where: { eventName } } },
  });

  if (!user) {
    await prisma.user.create({
      data: {
        address,
        projectId,
        balance: { create: { amount: points, eventName } },
      },
    });
    return apiResponse(200, { balance: points });
  }

  await prisma.balance.upsert({
    where: { userId_eventName: { userId: user.id, eventName } },
    create: { amount: points, eventName, userId: user.id },
    update: { amount: { increment: points } },
  });

  const totalUserBalance = await prisma.balance.aggregate({
    _sum: { amount: true },
    where: { userId: user.id },
  });

  return apiResponse(200, { balance: totalUserBalance._sum });
};
