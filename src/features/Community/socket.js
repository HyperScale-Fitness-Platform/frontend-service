import { io } from "socket.io-client";
import { getCurrentUser } from "../../utils/auth";

const socket = io("http://localhost:4003", {
    autoConnect: false,
});

export function connectSocket() {

    const currentUser = getCurrentUser();

    if (!currentUser?.id) {
        console.error(
            "Cannot connect socket: no logged-in user"
        );
        return;
    }

    socket.auth = {
        userId: currentUser.id,
        role: currentUser.role,
    };

    if (!socket.connected) {
        socket.connect();
    }
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