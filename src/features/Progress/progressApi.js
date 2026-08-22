import apiGatewayClient from "../../utils/api_getway";

const progressApi = {
  // Create a new InBody record
  createInBody: async (data) => {
    const response = await apiGatewayClient.post(
      "/progress/inbody",
      data
    );

    return response.data;
  },

  // Get one InBody record
  getInBody: async (id) => {
    const response = await apiGatewayClient.get(
      `/progress/inbody/${id}`
    );

    return response.data;
  },

  // Get customer's InBody history
  getInBodyHistory: async (
    customerId,
    { from, to, page = 1, limit = 20 } = {}
  ) => {
    const response = await apiGatewayClient.get(
      `/progress/inbody/customers/${customerId}`,
      {
        params: {
          from,
          to,
          page,
          limit,
        },
      }
    );

    return response.data;
  },

  // Get customer's latest InBody
  getLatestInBody: async (customerId) => {
    const response = await apiGatewayClient.get(
      `/progress/inbody/customers/${customerId}/latest`
    );

    return response.data;
  },

  // Update an InBody record
  updateInBody: async (id, data) => {
    const response = await apiGatewayClient.patch(
      `/progress/inbody/${id}`,
      data
    );

    return response.data;
  },

  // Delete an InBody record
  deleteInBody: async (id) => {
    const response = await apiGatewayClient.delete(
      `/progress/inbody/${id}`
    );

    return response.data;
  },

// =========================
  // EXERCISE PLANS
  // =========================

  createExercisePlan: async (data) => {
    const response =
      await apiGatewayClient.post(
        "/progress/exercise-plans",
        data
      );

    return response.data;
  },

  getExercisePlan: async (id) => {
    const response =
      await apiGatewayClient.get(
        `/progress/exercise-plans/${id}`
      );

    return response.data;
  },

  getExercisePlanHistory: async (
    customerId,
    { from, to, page = 1, limit = 20 } = {}
  ) => {
    const response =
      await apiGatewayClient.get(
        `/progress/exercise-plans/customers/${customerId}`,
        {
          params: {
            from,
            to,
            page,
            limit,
          },
        }
      );

    return response.data;
  },

  getLatestExercisePlan: async (
    customerId
  ) => {
    const response =
      await apiGatewayClient.get(
        `/progress/exercise-plans/customers/${customerId}/latest`
      );

    return response.data;
  },

  updateExercisePlan: async (
    id,
    data
  ) => {
    const response =
      await apiGatewayClient.patch(
        `/progress/exercise-plans/${id}`,
        data
      );

    return response.data;
  },

  deleteExercisePlan: async (id) => {
    const response =
      await apiGatewayClient.delete(
        `/progress/exercise-plans/${id}`
      );

    return response.data;
  },
  // =========================
// NUTRITION PLANS
// =========================

createNutritionPlan: async (data) => {
  const response =
    await apiGatewayClient.post(
      "/progress/nutrition-plans",
      data
    );

  return response.data;
},

getNutritionPlan: async (id) => {
  const response =
    await apiGatewayClient.get(
      `/progress/nutrition-plans/${id}`
    );

  return response.data;
},

getNutritionPlanHistory: async (
  customerId,
  {
    from,
    to,
    page = 1,
    limit = 20,
  } = {}
) => {
  const response =
    await apiGatewayClient.get(
      `/progress/nutrition-plans/customers/${customerId}`,
      {
        params: {
          from,
          to,
          page,
          limit,
        },
      }
    );

  return response.data;
},

getLatestNutritionPlan: async (
  customerId
) => {
  const response =
    await apiGatewayClient.get(
      `/progress/nutrition-plans/customers/${customerId}/latest`
    );

  return response.data;
},

updateNutritionPlan: async (
  id,
  data
) => {
  const response =
    await apiGatewayClient.patch(
      `/progress/nutrition-plans/${id}`,
      data
    );

  return response.data;
},

deleteNutritionPlan: async (id) => {
  const response =
    await apiGatewayClient.delete(
      `/progress/nutrition-plans/${id}`
    );

  return response.data;
},

};



export default progressApi;