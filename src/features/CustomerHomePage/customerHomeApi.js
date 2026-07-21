import apiGatewayClient from "../../utils/api_getway";


export const getCurrentMembership = async () => {

    const response = await apiGatewayClient.get(
        "/operations/membership/current"
    );

    return response.data;

};