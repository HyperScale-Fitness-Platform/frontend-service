import apiGatewayClient from "../../utils/api_getway";


// Get available PT package types
export const getPtPackageTypes = async () => {

    const response =
        await apiGatewayClient.get(
            "/operations/pt-packages/types"
        );

    return response.data;

};



// Purchase PT package
export const purchasePtPackage = async (packageType) => {

    const response =
        await apiGatewayClient.post(
            "/operations/pt-packages/purchase",
            {
                trainerId:
                "11b9cb5e-985a-4833-80c2-cac9cf23eaa3",

                packageType
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