import apiGatewayClient from "../../utils/api_getway";


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



// Get the sources a customer can use to book PT sessions
// (purchased packages + free membership PT credits)
export const getBookableSources = async () => {

    const customerId =
        getCustomerId();

    const response =
        await apiGatewayClient.get(
            "/operations/bookable-sources",
            {
                headers: {
                    "user-id": customerId,
                },
            }
        );

    return response.data;

};



// Get all open PT availability slots across trainers
// (free / membership credit sessions)
export const getFreePtAvailability = async (date) => {

    const response =
        await apiGatewayClient.get(
            "/operations/pt/free-availability",
            {
                params: date ? { date } : {},
            }
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
// The backend matches the slot by its start time (slotStart)
export const bookPtSessionViaMembership = async (slotStart) => {

    const customerId =
        getCustomerId();

    const response =
        await apiGatewayClient.post(
            "/operations/bookings",
            {
                customerId,
                type: "pt_session",
                sourceType: "free",
                slotStart
            }
        );

    return response.data;

};



// Book a PT session using a purchased package
export const bookPtSessionViaPackage = async (slotStart, ptPackageId) => {

    const customerId =
        getCustomerId();

    const response =
        await apiGatewayClient.post(
            "/operations/bookings",
            {
                customerId,
                type: "pt_session",
                sourceType: "package",
                sourceId: ptPackageId,
                slotStart
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