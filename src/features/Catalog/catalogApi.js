import apiGatewayClient from "../../utils/api_getway";

const CATALOG_BASE = "/catalog";

export const getCatalogProducts = async (params = {}) => {
  const response = await apiGatewayClient.get(`${CATALOG_BASE}/api/products`, {
    params: {
      is_active: true,
      limit: 20,
      page: 1,
      ...params,
    },
  });

  return response.data;
};

export const getCatalogProductById = async (productId) => {
  const response = await apiGatewayClient.get(
    `${CATALOG_BASE}/api/products/${productId}`,
  );
  return response.data;
};

export const createCatalogProduct = async (payload) => {
  const response = await apiGatewayClient.post(
    `${CATALOG_BASE}/api/products`,
    payload,
  );
  return response.data;
};

export const updateCatalogProduct = async (productId, payload) => {
  const response = await apiGatewayClient.put(
    `${CATALOG_BASE}/api/products/${productId}`,
    payload,
  );
  return response.data;
};

export const deleteCatalogProduct = async (productId) => {
  const response = await apiGatewayClient.delete(
    `${CATALOG_BASE}/api/products/${productId}`,
  );
  return response.data;
};
