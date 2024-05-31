import {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent,
} from "aws-lambda";
import { createHash } from "crypto";
import { getConnection } from "../../utils/database";

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  const apiKey = event.authorizationToken;

  const hash = createHash("sha256").update(apiKey).digest("base64");
  const prisma = getConnection();

  const project = await prisma.project.findUnique({ where: { hash } });
  const methodArn = event.methodArn;

  if (!project)
    return {
      principalId: "user",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Deny",
            Resource: methodArn,
          },
        ],
      },
    };

  return {
    principalId: "user",
    context: { projectId: project.id },
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: "Allow",
          Resource: methodArn,
        },
      ],
    },
  };
};
