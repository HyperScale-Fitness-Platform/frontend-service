import styles from "../Chat.module.css";

export default function MessageBubble({
    message,
    isMine
}) {

    return (
        <div
            className={
                isMine
                    ? `${styles.messageRow} ${styles.mine}`
                    : styles.messageRow
            }
        >
            <div className={styles.messageBubble}>

                <p>
                    {message.content}
                </p>

                <span className={styles.messageTime}>
                    {new Date(
                        message.created_at
                    ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                    })}
                </span>

            </div>
        </div>
    );
}