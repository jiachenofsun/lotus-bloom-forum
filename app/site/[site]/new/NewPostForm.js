"use client";
import ImageUpload from "@/app/components/ImageUpload";
import Spinner from "@/app/components/Spinner"; // Import your Spinner component
import styles from "./page.module.css";
import { useActionState } from "react";

export default function NewPostForm({ user, handleSubmit }) {
  const [state, formAction, isPending] = useActionState(handleSubmit, {
    error: null,
  });

  return (
    <form className={styles.formBox} action={formAction}>
      <p className={styles.posterName}>{user.name}</p>
      {state.error && <div className={styles.errorDiv}>{state.error}</div>}
      <input
        className={styles.titleInput}
        type="text"
        placeholder="Post Title"
        name="title"
        required
        disabled={isPending}
      />
      <textarea
        className={styles.contentInput}
        placeholder="Write your post here..."
        name="text"
        required
        disabled={isPending}
      />
      <ImageUpload disabled={isPending} />
      <button
        type="submit"
        className={styles.submitButton}
        disabled={isPending}
      >
        {isPending ? <Spinner /> : "Submit Post"}
      </button>
    </form>
  );
}
