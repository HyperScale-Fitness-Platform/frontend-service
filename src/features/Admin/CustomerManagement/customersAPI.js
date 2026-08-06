import axios from 'axios';

const AUTH_BASE_URL = ' http://localhost:8080/auth/register/';
const PROFILE_BASE_URL = 'http://localhost:4002/';

const CUSTOMERS_ENDPOINT = `${PROFILE_BASE_URL}api/profiles/customers`;
const REGISTER_ENDPOINT = `${AUTH_BASE_URL}auth/register`;

export const getCustomers = () => axios.get(CUSTOMERS_ENDPOINT);

export const createCustomer = (data) => axios.post(REGISTER_ENDPOINT, { ...data, role: "customer" });

// export const updateCustomerProfile = (customerId, data) => axios.put(`${CUSTOMERS_ENDPOINT}/${customerId}`, data);

// export const updateCustomerAuth = (customerId, data) => axios.patch(`${AUTH_BASE_URL}auth/${customerId}`, data);

// export const deleteCustomer = (customerId) => axios.delete(`${AUTH_BASE_URL}auth/${customerId}`);