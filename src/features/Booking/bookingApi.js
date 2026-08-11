import apiGatewayClient from "../../utils/api_getway";


// Single trainer used across the app for now (matches PTPackages purchase flow)
const TRAINER_ID = "11b9cb5e-985a-4833-80c2-cac9cf23eaa3";


function getCustomerId() {

    const token =
        localStorage.getItem("customerToken");

    if (!token) {
        throw new Error("Not logged in");
    }

    const payload =
        JSON.parse(
            atob(
                token.split(".")[1]
            )
        );

    return payload.sub;

}



// Get all classes
export const getAllClasses = async () => {

    const response =
        await apiGatewayClient.get(
            "/operations/classes"
        );

    return response.data;

};



// Get sessions for a class
export const getClassSessions = async (classId) => {

    const response =
        await apiGatewayClient.get(
            `/operations/classes/${classId}/sessions`
        );

    return response.data;

};



// Get the trainer's open slots
export const getTrainerSlots = async () => {

    const response =
        await apiGatewayClient.get(
            `/operations/trainers/${TRAINER_ID}/slots`
        );

    return response.data;

};



// Get available slots for a purchased PT package
export const getPackageAvailableSlots = async (ptPackageId) => {

    const response =
        await apiGatewayClient.get(
            `/operations/pt-packages/${ptPackageId}/available-slots`
        );

    return response.data;

};



// Get the current customer's bookings
export const getCustomerBookings = async () => {

    const customerId =
        getCustomerId();

    const response =
        await apiGatewayClient.get(
            `/operations/customers/${customerId}/bookings`
        );

    return response.data;

};



// Book a class session
export const bookClass = async (classSessionId) => {

    const customerId =
        getCustomerId();

    const response =
        await apiGatewayClient.post(
            "/operations/bookings",
            {
                customerId,
                type: "class",
                classSessionId
            }
        );

    return response.data;

};



// Book a PT session using the membership benefit
export const bookPtSessionViaMembership = async (trainerSlotId) => {

    const customerId =
        getCustomerId();

    const response =
        await apiGatewayClient.post(
            "/operations/bookings",
            {
                customerId,
                type: "pt_session",
                trainerSlotId,
                sessionSource: "membership"
            }
        );

    return response.data;

};



// Book a PT session using a purchased package
export const bookPtSessionViaPackage = async (trainerSlotId, ptPackageId) => {

    const customerId =
        getCustomerId();

    const response =
        await apiGatewayClient.post(
            "/operations/bookings",
            {
                customerId,
                type: "pt_session",
                trainerSlotId,
                sessionSource: "package",
                ptPackageId
            }
        );

    return response.data;

};



// Cancel a booking
export const cancelBooking = async (bookingId) => {

    const response =
        await apiGatewayClient.delete(
            `/operations/bookings/${bookingId}`
        );

    return response.data;

};



// Reschedule a PT session booking
export const rescheduleBooking = async (bookingId, newTrainerSlotId) => {

    const response =
        await apiGatewayClient.patch(
            `/operations/bookings/${bookingId}/reschedule`,
            {
                newTrainerSlotId
            }
        );

    return response.data;

};