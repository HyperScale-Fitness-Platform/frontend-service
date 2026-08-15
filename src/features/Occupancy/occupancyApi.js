import apiGatewayClient from "../../utils/api_getway";

export async function checkIn(customerId) {
    const response = await apiGatewayClient.post(
        "/operations/checkin",
        { customerId }
    );

    return response.data;
}

export async function checkOut(customerId) {
    const response = await apiGatewayClient.post(
        "/operations/checkout",
        { customerId }
    );

    return response.data;
}

export async function getCurrentOccupancy() {
    const response = await apiGatewayClient.get(
        "/operations/current"
    );

    return response.data;
}

export async function getCustomers() {
    const response = await apiGatewayClient.get(
        "/operations/customers"
    );

    return response.data;
}