import apiGatewayClient from '../../../utils/api_getway';

// --- Admin/Trainer: catalog & availability ---

export function createClass(data) {
  return apiGatewayClient.post('/operations/classes', data);
}

export function scheduleSession(classId, data) {
  return apiGatewayClient.post(`/operations/classes/${classId}/sessions`, data);
}

export function openTrainerSlot(trainerId, data) {
  return apiGatewayClient.post(`/operations/trainers/${trainerId}/slots`, data);
}

export function getTrainerSchedule(trainerId) {
  return apiGatewayClient.get(`/operations/trainers/${trainerId}/schedule`);
}

// --- Customer: browse ---

export function getClasses() {
  return apiGatewayClient.get('/operations/classes');
}

export function getClassSessions(classId) {
  return apiGatewayClient.get(`/operations/classes/${classId}/sessions`);
}

export function getTrainerSlots(trainerId) {
  return apiGatewayClient.get(`/operations/trainers/${trainerId}/slots`);
}

export function getAvailableSlotsForPackage(packageId) {
  return apiGatewayClient.get(`/operations/pt-packages/${packageId}/available-slots`);
}

// --- Customer: bookings ---

export function getMyBookings(customerId) {
  return apiGatewayClient.get(`/operations/customers/${customerId}/bookings`);
}

export function bookClass(customerId, classSessionId) {
  return apiGatewayClient.post('/operations/bookings', {
    customerId,
    type: 'class',
    classSessionId,
  });
}

export function bookPtSessionViaMembership(customerId, trainerSlotId) {
  return apiGatewayClient.post('/operations/bookings', {
    customerId,
    type: 'pt_session',
    trainerSlotId,
    sessionSource: 'membership',
  });
}

export function bookPtSessionViaPackage(customerId, trainerSlotId, ptPackageId) {
  return apiGatewayClient.post('/operations/bookings', {
    customerId,
    type: 'pt_session',
    trainerSlotId,
    sessionSource: 'package',
    ptPackageId,
  });
}

export function rescheduleBooking(bookingId, { newClassSessionId, newTrainerSlotId }) {
  return apiGatewayClient.patch(`/operations/bookings/${bookingId}/reschedule`, {
    newClassSessionId,
    newTrainerSlotId,
  });
}

export function cancelBooking(bookingId) {
  return apiGatewayClient.delete(`/operations/bookings/${bookingId}`);
}