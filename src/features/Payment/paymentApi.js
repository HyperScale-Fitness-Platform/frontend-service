import apiGatewayClient from "../../utils/api_getway";


// Get the current customer's payments
export const getMyPayments = async () => {

    const response =
        await apiGatewayClient.get(
            "/payments/me"
        );

    return response.data;

};



// Get a single payment
export const getPaymentById = async (paymentId) => {

    const response =
        await apiGatewayClient.get(
            `/payments/${paymentId}`
        );

    return response.data;

};



// Resume / continue a payment (returns a fresh client secret)
export const continuePayment = async (paymentId) => {

    const response =
        await apiGatewayClient.post(
            `/payments/${paymentId}/continue`
        );

    return response.data;

};



// Delete a pending payment
export const deletePayment = async (paymentId) => {

    const response =
        await apiGatewayClient.delete(
            `/payments/${paymentId}`
        );

    return response.data;

};