import apiGatewayClient from '../../../utils/api_getway';

export const getAdminThreads = async () => {
  const response = await apiGatewayClient.get('/social/admin/threads');
  return response.data;
};

export const adminDeleteThread = async (threadId) => {
  const response = await apiGatewayClient.delete(`/social/admin/threads/${threadId}`);
  return response.data;
};

export const adminDeleteComment = async (threadId, commentId) => {
  const response = await apiGatewayClient.delete(
    `/social/admin/threads/${threadId}/comments/${commentId}`
  );
  return response.data;
};