import apiGatewayClient from "../../utils/api_getway";


// ===============================
// Get current customer membership
// ===============================

export const getCurrentMembership = async () => {

    const response =
        await apiGatewayClient.get(
            "/operations/membership/current"
        );

    return response.data;

};




// ===============================
// Get all available plans
// ===============================

export const getPlans = async () => {

    const response =
        await apiGatewayClient.get(
            "/operations/membership/plans"
        );

    return response.data;

};




// ===============================
// Subscribe to a plan
// ===============================

export const subscribeToPlan = async(planId) => {


    const response =
        await apiGatewayClient.post(
            "/operations/memberships/subscribe",
            {
                planId
            }
        );


    return response.data;

};




// ===============================
// Freeze membership
// ===============================

export const freezeMembership = async(
    membershipId,
    days
) => {


    const response =
        await apiGatewayClient.post(
            `/operations/memberships/${membershipId}/freeze`,
            {
                days
            }
        );


    return response.data;

};




// ===============================
// Unfreeze membership
// ===============================

export const unfreezeMembership = async(
    membershipId
) => {


    const response =
        await apiGatewayClient.post(
            `/operations/memberships/${membershipId}/unfreeze`
        );


    return response.data;

};




// ===============================
// Get available PT package types
// ===============================

export const getPtPackageTypes = async() => {


    const response =
        await apiGatewayClient.get(
            "/operations/pt-packages/types"
        );


    return response.data;

};




// ===============================
// Purchase PT package
// ===============================

export const purchasePtPackage = async(data) => {


    const response =
        await apiGatewayClient.post(
            "/operations/pt-packages/purchase",
            data
        );


    return response.data;

};




// ===============================
// Get customer's purchased PT packages
// ===============================

export const getCustomerPtPackages = async(
    customerId
) => {


    const response =
        await apiGatewayClient.get(
            `/operations/customers/${customerId}/pt-packages`
        );


    return response.data;

};