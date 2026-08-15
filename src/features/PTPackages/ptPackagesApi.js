import apiGatewayClient from "../../utils/api_getway";


// Get available PT package types
export const getPtPackageTypes = async () => {

    const response =
        await apiGatewayClient.get(
            "/operations/pt-packages/types"
        );

    return response.data;

};

export const getAvailableTrainers = async () => {

    const response =
        await apiGatewayClient.get(
            "/operations/trainers/available"
        );

    return response.data;
};




// Purchase PT package
export const purchasePtPackage = async (trainerId, packageType) => {

    const response =
        await apiGatewayClient.post(
            "/operations/pt-packages/purchase",
            {
                trainerId,
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