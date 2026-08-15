import { useState } from "react";
import toast from "react-hot-toast";

import styles from "../Chat.module.css";

export default function MessageInput({
    onSend,
    disabled
}) {

    const [content, setContent] = useState("");

    async function handleSubmit(e) {

        e.preventDefault();

        const message = content.trim();

        if (!message) {
            return;
        }

        try {

            await onSend(message);

            setContent("");

        } catch (error) {

            console.error(error);

            toast.error(
                error.message ||
                "Failed to send message"
            );

        }
    }

    return (
        <form
            className={styles.inputArea}
            onSubmit={handleSubmit}
        >

            <input
                type="text"
                value={content}
                onChange={(e) =>
                    setContent(e.target.value)
                }
                placeholder="Write a message..."
                disabled={disabled}
            />

            <button
                type="submit"
                disabled={
                    disabled ||
                    !content.trim()
                }
            >
                Send
            </button>

        </form>
    );
}