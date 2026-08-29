import { io } from "socket.io-client";
import { getCurrentUser } from "../../utils/auth";

// In production the frontend and the API gateway share the same origin
// (the ALB), and the gateway proxies /socket.io -> social-service, so the
// socket connects back to window.location.origin. VITE_SOCKET_URL overrides
// this for local dev (e.g. http://localhost:4003).
const SOCKET_URL =
    import.meta.env.VITE_SOCKET_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:4003");

const socket = io(SOCKET_URL, {
    autoConnect: false,
});

/*
 * Returns the userId the socket is currently
 * authenticated as (from socket.auth), or null.
 */
function currentSocketUserId() {
    return socket.auth?.userId || null;
}

export function connectSocket() {

    const currentUser = getCurrentUser();

    if (!currentUser?.id) {
        console.error(
            "Cannot connect socket: no logged-in user"
        );
        return;
    }

    /*
     * If the socket is already connected as a DIFFERENT
     * user (account switched without a page reload),
     * drop the stale connection first — otherwise every
     * message would be sent under the old identity.
     */
    if (
        currentSocketUserId() &&
        currentSocketUserId() !== currentUser.id
    ) {
        console.log(
            "Socket identity changed, reconnecting..."
        );
        socket.disconnect();
    }

    socket.auth = {
        userId: currentUser.id,
        role: currentUser.role,
    };

    if (!socket.connected) {
        socket.connect();
    }
}

export function disconnectSocket() {
    if (socket.connected) {
        socket.disconnect();
    }

    // Clear the stored identity so a later
    // connectSocket() can never reuse it.
    socket.auth = null;
}


socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
});


socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
});


socket.on("connect_error", (err) => {
    console.error(
        "Socket connection error:",
        err.message
    );
});


export default socket;
