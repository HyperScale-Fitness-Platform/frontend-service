import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import {
    createThread
} from "../communityApi";

import styles from "../Community.module.css";

const threadSchema = z.object({

    title: z
        .string()
        .trim()
        .min(1, "Title is required")
        .max(100, "Title is too long"),

    content: z
        .string()
        .trim()
        .min(1, "Content is required")
        .max(2000, "Content is too long")

});

export default function CreateThreadForm({
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

        resolver: zodResolver(threadSchema)

    });


    async function onSubmit(data) {

        try {

            await createThread(data);

            toast.success(
                "Post created successfully"
            );

            reset();

            onCreated();

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.error ||
                "Failed to create post"
            );

        }

    }


    return (

        <form
            className={styles.createCard}
            onSubmit={handleSubmit(onSubmit)}
        >

            <div className={styles.createHeader}>

                <h2>
                    Start a conversation
                </h2>

                <p>
                    Share something with the gym community.
                </p>

            </div>


            <div className={styles.field}>

                <label>
                    Title
                </label>

                <input
                    className={styles.input}
                    placeholder="What's on your mind?"
                    {...register("title")}
                />

                {errors.title && (

                    <span className={styles.errorText}>
                        {errors.title.message}
                    </span>

                )}

            </div>


            <div className={styles.field}>

                <label>
                    Post
                </label>

                <textarea
                    className={styles.textarea}
                    placeholder="Write your post..."
                    {...register("content")}
                />

                {errors.content && (

                    <span className={styles.errorText}>
                        {errors.content.message}
                    </span>

                )}

            </div>


            <button
                className={styles.submitBtn}
                type="submit"
                disabled={isSubmitting}
            >
                {isSubmitting
                    ? "Posting..."
                    : "Post to Community"
                }
            </button>

        </form>

    );
}
