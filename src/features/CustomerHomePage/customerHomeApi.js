import apiGatewayClient from "../../utils/api_getway";

export const getCurrentMembership = async () => {
  const response = await apiGatewayClient.get(
    "/operations/membership/current"
  );
  return response.data;
};

export const getUserStatus = async (userId) => {
  const response = await apiGatewayClient.get(`/auth/${userId}/status`);
  return response.data;
};

export const getCustomerProfile = async (userId) => {
  const response = await apiGatewayClient.get(`/api/profiles/customers/${userId}`);
  return response.data;
};

export const activateUser = async (userId, oldPassword, newPassword) => {
  const response = await apiGatewayClient.patch(`/auth/${userId}`, {
    is_active: true,
    old_password: oldPassword,
    new_password: newPassword
  });
  return response.data;
};
