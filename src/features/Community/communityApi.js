import apiGatewayClient from "../../utils/api_getway";

// ================================
// THREADS
// ================================

export const getAllThreads = () =>
    apiGatewayClient.get("/social/threads");

export const getUserThreads = (userId) =>
    apiGatewayClient.get(`/social/users/${userId}/threads`);

export const createThread = (data) =>
    apiGatewayClient.post("/social/threads", data);

export const getThreadById = (id) =>
    apiGatewayClient.get(`/social/threads/${id}`);

export const updateThread = (id, data) =>
    apiGatewayClient.put(`/social/threads/${id}`, data);

export const deleteThread = (id) =>
    apiGatewayClient.delete(`/social/threads/${id}`);


// ================================
// COMMENTS
// ================================

export const getThreadComments = (threadId) =>
    apiGatewayClient.get(`/social/threads/${threadId}/comments`);

export const createComment = (threadId, data) =>
    apiGatewayClient.post(
        `/social/threads/${threadId}/comments`,
        data
    );

export const updateComment = (
    threadId,
    commentId,
    data
) =>
    apiGatewayClient.put(
        `/social/threads/${threadId}/comments/${commentId}`,
        data
    );

export const deleteComment = (
    threadId,
    commentId
) =>
    apiGatewayClient.delete(
        `/social/threads/${threadId}/comments/${commentId}`
    );


// ================================
// ADMIN
// ================================

export const adminDeleteThread = (id) =>
    apiGatewayClient.delete(
        `/social/admin/threads/${id}`
    );

