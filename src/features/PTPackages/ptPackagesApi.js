import apiGatewayClient from "../../utils/api_getway";


// Get available PT session offerings (admin-defined catalog)
export const getPtPackageTypes = async () => {

    const response =
        await apiGatewayClient.get(
            "/operations/pt-sessions"
        );

    return response.data;

};



// Get trainers customers can purchase PT sessions with
export const getTrainers = async () => {

    const response =
        await apiGatewayClient.get(
            "/api/profiles/trainers"
        );

    return response.data;

};



// Get trainers that currently have open future slots
export const getAvailableTrainers = async () => {

    const response =
        await apiGatewayClient.get(
            "/operations/trainers/available"
        );

    return response.data;

};



// Purchase PT session offering
export const purchasePtPackage = async (sessionId, trainerId) => {

    const response =
        await apiGatewayClient.post(
            "/operations/pt-packages/purchase",
            {
                trainerId,

                sessionId
            }
        );

    return response.data;

};



// Get customer's PT packages
export const getCustomerPackages = async () => {

    const token =
        localStorage.getItem("customerToken");


    const payload =
        JSON.parse(
            atob(
                token.split(".")[1]
            )
        );


    const customerId =
        payload.sub;


    const response =
        await apiGatewayClient.get(
            `/operations/customers/${customerId}/pt-packages`
        );


    return response.data;

};



// Delete an orphaned pending package (one that has no payment row behind it)
export const deletePendingPackage = async (packageId) => {

    const response =
        await apiGatewayClient.delete(
            `/operations/pt-packages/${packageId}`
        );


    return response.data;

};