import apiGatewayClient from "../../utils/api_getway";

export const sendAIMessage = async ({ message, sessionId }) => {
  const payload = {
    message,
  };

  if (sessionId) {
    payload.sessionId = sessionId;
  }

  const response = await apiGatewayClient.post('/ai/chat', payload);

  return response.data;
};