import apiGatewayClient from "../../utils/api_getway";

export const getConversation = (otherUserId) =>
    apiGatewayClient.get(`/chat/${otherUserId}`);

export const getChatConnections = () =>
    apiGatewayClient.get("/chat/connections");