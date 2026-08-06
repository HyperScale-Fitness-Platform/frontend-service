import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import {
    createComment
} from "../communityApi";

import styles from "../Community.module.css";

const commentSchema = z.object({

    content: z
        .string()
        .trim()
        .min(1, "Comment cannot be empty")
        .max(1000, "Comment is too long")

});


export default function CommentForm({
    threadId,
    onCreated
}) {

    const {
        register,
        handleSubmit,
        reset,
        formState: {
            errors,
            isSubmitting
        }

    } = useForm({

        resolver: zodResolver(commentSchema)

    });


    async function onSubmit(data) {

        try {

            await createComment(
                threadId,
                data
            );

            toast.success(
                "Comment added"
            );

            reset();

            onCreated();

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.error ||
                "Failed to add comment"
            );

        }

    }


    return (

        <form
            className={styles.commentForm}
            onSubmit={handleSubmit(onSubmit)}
        >

            <textarea
                className={styles.textarea}
                placeholder="Join the conversation..."
                {...register("content")}
            />

            {errors.content && (

                <span className={styles.errorText}>
                    {errors.content.message}
                </span>

            )}

            <button
                className={styles.submitBtn}
                type="submit"
                disabled={isSubmitting}
            >

                {isSubmitting
                    ? "Posting..."
                    : "Add Comment"
                }

            </button>

        </form>

    );

}
