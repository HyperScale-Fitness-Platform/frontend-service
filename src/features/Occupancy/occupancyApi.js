import apiGatewayClient from "../../utils/api_getway";


export async function checkIn(){

    const response =
        await apiGatewayClient.post(
            "/operations/checkin"
        );

    return response.data;

}



export async function checkOut(){

    const response =
        await apiGatewayClient.post(
            "/operations/checkout"
        );

    return response.data;

}



export async function getCurrentOccupancy(){

    const response =
        await apiGatewayClient.get(
            "/operations/current"
        );

    return response.data;

}