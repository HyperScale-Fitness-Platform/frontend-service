import { useEffect, useState } from "react";
import { useParams } from "react-router";
import toast from "react-hot-toast";

import {
    getConversation
} from "./chatApi";

import MessageBubble from "./components/MessageBubble";
import MessageInput from "./components/MessageInput";

import {
    getCurrentUser
} from "../../utils/auth";

import socket, { connectSocket } from "../Community/socket";

import styles from "./Chat.module.css";

export default function Chat() {

    const { otherUserId } = useParams();

    const currentUser = getCurrentUser();

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [socketConnected, setSocketConnected] = useState(socket.connected);


    useEffect(() => {

        connectSocket();

        function handleConnect() {

            setSocketConnected(true);

        }

        function handleDisconnect() {

            setSocketConnected(false);

        }

        socket.on("connect", handleConnect);

        socket.on("disconnect", handleDisconnect);

        return () => {

            socket.off("connect", handleConnect);

            socket.off("disconnect", handleDisconnect);

        };

    }, []);

    // ==========================================
    // LOAD CONVERSATION
    // ==========================================

    async function loadConversation() {

        try {

            setLoading(true);

            const response =
                await getConversation(otherUserId);

            setMessages(response.data);

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.error ||
                "Failed to load conversation"
            );

        } finally {

            setLoading(false);

        }
    }


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {

        if (!otherUserId) return;

        loadConversation();

    }, [otherUserId]);


    // ==========================================
    // REAL-TIME MESSAGE LISTENER
    // ==========================================

    useEffect(() => {

        if (!otherUserId || !currentUser?.id) {
            return;
        }


        function handleNewMessage(message) {

            console.log("NEW MESSAGE RECEIVED:", message);
            console.log("Current user:", currentUser.id);
            console.log("Other user:", otherUserId);

            const belongsToConversation =
                (
                    message.sender_id === otherUserId &&
                    message.receiver_id === currentUser.id
                ) ||
                (
                    message.sender_id === currentUser.id &&
                    message.receiver_id === otherUserId
                );

            console.log(
                "Belongs to this conversation:",
                belongsToConversation
            );

            if (!belongsToConversation) {
                return;
            }

            setMessages(prevMessages => {

                const exists = prevMessages.some(
                    item => item.id === message.id
                );

                if (exists) {
                    return prevMessages;
                }

                return [
                    ...prevMessages,
                    message
                ];
            });
        }


        socket.on(
            "new_message",
            handleNewMessage
        );


        return () => {

            socket.off(
                "new_message",
                handleNewMessage
            );

        };

    }, [
        otherUserId,
        currentUser?.id
    ]);


    // ==========================================
    // SEND MESSAGE
    // ==========================================

    function sendMessage(content) {

        return new Promise((resolve, reject) => {

            socket.emit(
                "send_message",
                {
                    receiverId: otherUserId,
                    content
                },
                (response) => {

                    if (
                        response?.status === "ok"
                    ) {

                        /*
                         * The backend emits the saved
                         * message back through Socket.IO.
                         *
                         * So don't manually add it here.
                         */

                        resolve(
                            response.message
                        );

                    } else {

                        reject(
                            new Error(
                                response?.error ||
                                "Failed to send message"
                            )
                        );

                    }

                }
            );

        });

    }


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (
            <div className={styles.page}>

                <div className={styles.status}>
                    Loading conversation...
                </div>

            </div>
        );

    }


    // ==========================================
    // UI
    // ==========================================

    return (

        <div className={styles.page}>

            <div className={styles.chatContainer}>

                <header className={styles.header}>

                    <p className={styles.eyebrow}>
                        DIRECT MESSAGE
                    </p>

                    <h1 className={styles.title}>
                        Trainer Chat
                    </h1>

                    <p className={styles.subtitle}>
                        Chat with your personal trainer.
                    </p>

                </header>


                <div className={styles.messages}>

                    {messages.length === 0 ? (

                        <div className={styles.empty}>

                            <h3>
                                No messages yet
                            </h3>

                            <p>
                                Start the conversation.
                            </p>

                        </div>

                    ) : (

                        messages.map(message => (

                            <MessageBubble
                                key={message.id}
                                message={message}
                                isMine={
                                    message.sender_id ===
                                    currentUser.id
                                }
                            />

                        ))

                    )}

                </div>


                <MessageInput
                    onSend={sendMessage}
                    disabled={!socketConnected}
                />

            </div>

        </div>

    );
}