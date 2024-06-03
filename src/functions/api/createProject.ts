import { APIGatewayEvent } from "aws-lambda";
import { apiResponse } from "../../utils/api";
import { getConnection } from "../../utils/database";
import { createHash, randomUUID } from "crypto";
import { createId } from "@paralleldrive/cuid2";

export const handler = async (event: APIGatewayEvent) => {
  if (!event.body)
    return apiResponse(401, { message: "Missing Body in the Request" });

  const { id } = JSON.parse(event.body);

  const prisma = getConnection();

  const apiKey = randomUUID();

  const hash = createHash("sha256").update(apiKey).digest("base64");

  const project = await prisma.project.create({
    data: { id: id || createId(), hash },
  });

  return apiResponse(200, { id: project.id, apiKey });
};
