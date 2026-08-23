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

// NOTE: the backend serves the history under /ai/chat/history.
export const getAIHistory = async () => {
  const response = await apiGatewayClient.get(
    '/ai/chat/history'
  );

  return response.data;
};

/*
 * AI Plans Coach — history-aware plan generation chat.
 * Response: { sessionId, reply, draft|null, hasPlanHistory }
 */
export const sendPlanCoachMessage = async ({ message, sessionId }) => {
  const payload = {
    message,
  };

  if (sessionId) {
    payload.sessionId = sessionId;
  }

  const response = await apiGatewayClient.post(
    '/ai/plans/chat',
    payload
  );

  return response.data;
};

export const getPlanCoachHistory = async () => {
  const response = await apiGatewayClient.get(
    '/ai/plans/chat/history'
  );

  return response.data;
};
