export const apiResponse = (statusCode: number, body: any) => {
  return {
    statusCode,
    body: body ? JSON.stringify(body) : null,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
  };
};
