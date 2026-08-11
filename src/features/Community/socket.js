import { io } from "socket.io-client";
import { getCurrentUser } from "../../utils/auth";

const currentUser = getCurrentUser();

const socket = io("http://localhost:4003", {
    auth: {
        userId: currentUser?.id,
        role: currentUser?.role,
    },
    autoConnect: true,
});

socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
});

socket.on("disconnect", () => {
    console.log("Socket disconnected");
});

socket.on("connect_error", (err) => {
    console.log(err);
});

export default socket;