import apiGatewayClient from "../../utils/api_getway";

/*
 * Customers who bought an ACTIVE or EXHAUSTED
 * PT package from the logged-in trainer.
 */
export const getTrainerCustomers = async (trainerId) => {
    const response = await apiGatewayClient.get(
        `/operations/trainers/${trainerId}/customers`
    );

    return response.data;
};
