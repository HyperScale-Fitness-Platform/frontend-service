import apiGatewayClient from '../../../utils/api_getway';

export const getTrainers = () => apiGatewayClient.get('/api/profiles/trainers');

export const createTrainer = (data) => apiGatewayClient.post('/auth/register', { ...data, role: "trainer" });

export const updateTrainerProfile = (trainerId, data) => apiGatewayClient.put(`/api/profiles/trainers/${trainerId}`, data);

export const updateTrainerAuth = (trainerId, data) => apiGatewayClient.patch(`/auth/${trainerId}`, data);

export const deleteTrainer = (trainerId) => apiGatewayClient.delete(`/auth/${trainerId}`);
