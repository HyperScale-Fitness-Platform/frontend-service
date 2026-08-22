import apiGatewayClient from "../../utils/api_getway";

// The API gateway exposes order-service under /orders and strips the
// prefix before forwarding, so calls land on order-service's own
// /api/cart and /api/orders routes.
const ORDER_BASE = "/orders";

export const getCart = async () => {
  const response = await apiGatewayClient.get(`${ORDER_BASE}/api/cart`);
  return response.data;
};

export const addCartItem = async (productId, quantity) => {
  const response = await apiGatewayClient.post(`${ORDER_BASE}/api/cart/items`, {
    product_id: productId,
    quantity,
  });
  return response.data;
};

export const updateCartItem = async (productId, quantity) => {
  const response = await apiGatewayClient.put(
    `${ORDER_BASE}/api/cart/items/${productId}`,
    { quantity },
  );
  return response.data;
};

export const removeCartItem = async (productId) => {
  await apiGatewayClient.delete(`${ORDER_BASE}/api/cart/items/${productId}`);
};

export const checkout = async () => {
  const response = await apiGatewayClient.post(`${ORDER_BASE}/api/orders/checkout`);
  return response.data;
};

export const getOrders = async () => {
  const response = await apiGatewayClient.get(`${ORDER_BASE}/api/orders`);
  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await apiGatewayClient.get(`${ORDER_BASE}/api/orders/${orderId}`);
  return response.data;
};
