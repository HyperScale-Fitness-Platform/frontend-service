import apiGatewayClient from "../../utils/api_getway";


// Single trainer used across the app for now (matches PTPackages purchase flow)


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

// Get available slots for a specific trainer
export const getTrainerSlots = async (trainerId) => {

    const response =
        await apiGatewayClient.get(
            `/operations/trainers/${trainerId}/slots`
        );

    return response.data;
};



// Get the trainer's open slots
// export const getTrainerSlots = async () => {

//     const response =
//         await apiGatewayClient.get(
//             `/operations/trainers/${TRAINER_ID}/slots`
//         );

//     return response.data;

// };



// Get available slots for a purchased PT package
// export const getPackageAvailableSlots = async (ptPackageId) => {

//     const customerId = getCustomerId();
//     const response =
//         await apiGatewayClient.get(
//             `/operations/pt-packages/${ptPackageId}/available-slots`,

//             {
//                 headers: {
//                     "user-id": customerId,
//                 },
//             }
//         );

//     return response.data;

// };



// Get the current customer's bookings
// export const getCustomerBookings = async () => {

//     const customerId =
//         getCustomerId();

//     const response =
//         await apiGatewayClient.get(
//             `/operations/customers/${customerId}/bookings`
//         );

//     return response.data;

// };

export const getCustomerBookings = async () => {
    const customerId = getCustomerId();

    const response = await apiGatewayClient.get(
        `/operations/customers/${customerId}/bookings`
    );

    console.log("CUSTOMER BOOKINGS RESPONSE:", response.data);

    // Handle either:
    // [ ... ]
    // or { data: [ ... ] }
    // or { bookings: [ ... ] }

    if (Array.isArray(response.data)) {
        return response.data;
    }

    if (Array.isArray(response.data?.data)) {
        return response.data.data;
    }

    if (Array.isArray(response.data?.bookings)) {
        return response.data.bookings;
    }

    return [];
};


// Book a class session
export const bookClass = async (classSessionId) => {

    const customerId =
        getCustomerId();

    const response =
        await apiGatewayClient.post(
            "/operations/bookings",
            {
                type: "class",
                classSessionId
            },
            {
                headers: {
                    "user-id": customerId,
                },
            }
        );
    return response.data;

};



// // Book a PT session using the membership benefit
// export const bookPtSessionViaMembership = async (trainerSlotId) => {

//     const customerId =
//         getCustomerId();

//     const response =
//         await apiGatewayClient.post(
//             "/operations/bookings",
//             {
//                 customerId,
//                 type: "pt_session",
//                 trainerSlotId,
//                 sessionSource: "membership"
//             }
//         );

//     return response.data;

// };



// // Book a PT session using a purchased package
// export const bookPtSessionViaPackage = async (trainerSlotId, ptPackageId) => {

//     const customerId =
//         getCustomerId();

//     const response =
//         await apiGatewayClient.post(
//             "/operations/bookings",
//             {
//                 customerId,
//                 type: "pt_session",
//                 trainerSlotId,
//                 sessionSource: "package",
//                 ptPackageId
//             }
//         );

//     return response.data;

// };

export const getBookableSources = async () => {
    const customerId = getCustomerId();

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

export const getPackageAvailability = async (
    packageId,
    date
) => {
    
    const customerId = getCustomerId();

    const response =
        await apiGatewayClient.get(
            `/operations/pt-packages/${packageId}/available-slots`,
            {
                params: date ? { date } : {},
                headers: {
                    "user-id": customerId,
                },
            }
        );

    return response.data;
};

export const getFreePtAvailability = async (
    date
) => {

    const response =
        await apiGatewayClient.get(
            "/operations/pt/free-availability",
            {
                params: {
                    date
                }
            }
        );

    return response.data;
};

export const bookPtSession = async ({
    sourceType,
    sourceId,
    slotStart
}) => {
    const customerId = getCustomerId();

    const response =
        await apiGatewayClient.post(
            "/operations/bookings",
            {
                type: "pt_session",
                sourceType,
                sourceId,
                slotStart
            },
            {
                headers: {
                    "user-id": customerId,
                },
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