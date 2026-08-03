import axios from 'axios';

const AUTH_BASE_URL = 'http://localhost:4000/';
const PROFILE_BASE_URL = 'http://localhost:4002/';

const TRAINERS_ENDPOINT = `${PROFILE_BASE_URL}api/profiles/trainers`;
const REGISTER_ENDPOINT = `${AUTH_BASE_URL}auth/register`;

export const getTrainers = () => axios.get(TRAINERS_ENDPOINT);

export const createTrainer = (data) => axios.post(REGISTER_ENDPOINT, { ...data, role: "trainer" });

export const updateTrainerProfile = (trainerId, data) => axios.put(`${TRAINERS_ENDPOINT}/${trainerId}`, data);

export const updateTrainerAuth = (trainerId, data) => axios.patch(`${AUTH_BASE_URL}auth/${trainerId}`, data);

export const deleteTrainer = (trainerId) => axios.delete(`${AUTH_BASE_URL}auth/${trainerId}`);