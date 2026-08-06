import apiGatewayClient from "../../utils/api_getway";
import axios from "axios";

const AUTH_SERVICE_URL = "http://localhost:4000/auth";

export const getCurrentMembership = async () => {
  const response = await apiGatewayClient.get(
    "/operations/membership/current"
  );
  return response.data;
};

export const getUserStatus = async (userId) => {
  const response = await axios.get(`${AUTH_SERVICE_URL}/${userId}/status`);
  return response.data;
};

export const activateUser = async (userId, oldPassword, newPassword) => {
  const response = await axios.patch(`${AUTH_SERVICE_URL}/${userId}`, {
    is_active: true,
    old_password: oldPassword,
    new_password: newPassword
  });
  return response.data;
};