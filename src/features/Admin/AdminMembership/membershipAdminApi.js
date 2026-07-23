import apiGatewayClient from "../../../utils/api_getway";

export async function createPlan(data) {
    return await apiGatewayClient.post(
        "/operations/plans",
        data
    );
}

export async function getAdminPlans() {

    const response =
        await apiGatewayClient.get(
            "/operations/admin/plans"
        );

    return response.data;

}
export async function addBenefit(planId, data) {
    return await apiGatewayClient.post(
        `/operations/plans/${planId}/benefits`,
        data
    );
}