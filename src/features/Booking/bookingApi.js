import apiGatewayClient from "../../utils/api_getway";


// =========================
// Helper
// =========================

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



// =========================
// Admin / Trainer
// =========================


export function createClass(data) {

    return apiGatewayClient.post(
        "/operations/classes",
        data
    );

}



export function scheduleSession(classId, data) {

    return apiGatewayClient.post(
        `/operations/classes/${classId}/sessions`,
        data
    );

}



export function openTrainerSlot(trainerId, data) {

    return apiGatewayClient.post(
        `/operations/trainers/${trainerId}/slots`,
        data
    );

}



export function getTrainerSchedule(trainerId) {

    return apiGatewayClient.get(
        `/operations/trainers/${trainerId}/schedule`
    );

}



// =========================
// Customer Browse
// =========================


export async function getClasses() {

    const response =
        await apiGatewayClient.get(
            "/operations/classes"
        );

    return response.data;

}



export async function getClassSessions(classId) {

    const response =
        await apiGatewayClient.get(
            `/operations/classes/${classId}/sessions`
        );

    return response.data;

}



export async function getTrainerSlots(trainerId) {

    const response =
        await apiGatewayClient.get(
            `/operations/trainers/${trainerId}/slots`
        );

    return response.data;

}



export async function getAvailableSlotsForPackage(packageId) {

    const response =
        await apiGatewayClient.get(
            `/operations/pt-packages/${packageId}/available-slots`
        );

    return response.data;

}



// =========================
// Customer Bookings
// =========================


export async function getMyBookings() {

    const customerId =
        getCustomerId();


    const response =
        await apiGatewayClient.get(
            `/operations/customers/${customerId}/bookings`
        );


    return response.data;

}




export async function bookClass(classSessionId) {


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

}




export async function bookPtSessionViaMembership(trainerSlotId) {


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

}




export async function bookPtSessionViaPackage(
    trainerSlotId,
    ptPackageId
) {


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

}




export async function cancelBooking(bookingId) {


    const response =
        await apiGatewayClient.delete(
            `/operations/bookings/${bookingId}`
        );


    return response.data;

}




export async function rescheduleBooking(
    bookingId,
    newTrainerSlotId
) {


    const response =
        await apiGatewayClient.patch(
            `/operations/bookings/${bookingId}/reschedule`,
            {
                newTrainerSlotId
            }
        );


    return response.data;

}