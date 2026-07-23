import axios from 'axios';

const BASE_URL = 'http://localhost:4002/';
const TRAINERS_ENDPOINT = `${BASE_URL}api/profiles/trainers`;

export const getTrainers = () => axios.get(TRAINERS_ENDPOINT);

export const createTrainer = (data) => axios.post(TRAINERS_ENDPOINT, data);

export const updateTrainer = (trainerId, data) =>
  axios.put(`${TRAINERS_ENDPOINT}/${trainerId}`, data);

export const deleteTrainer = (trainerId) =>
  axios.delete(`${TRAINERS_ENDPOINT}/${trainerId}`);