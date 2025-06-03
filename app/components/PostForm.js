"use client";
import { useRef } from "react";
import ImageUpload from "@/app/components/ImageUpload";
import Spinner from "@/app/components/Spinner";
import styles from "./PostForm.module.css";
import { useActionState } from "react";

export default function PostForm({
  user,
  handleSubmit,
  initialTitle = "",
  initialText = "",
  initialImages = [],
  submitButtonText = "Submit Post",
  successMessage = "Post created successfully",
}) {
  const [state, formAction, isPending] = useActionState(handleSubmit, {
    error: null,
  });

  const markImagesAsUsedRef = useRef(null);

  // Handle the markImagesAsUsed callback from ImageUpload
  const handleMarkAsUsedReady = (markAsUsedFn) => {
    markImagesAsUsedRef.current = markAsUsedFn;
  };

  // Enhanced form action that handles image cleanup
  const enhancedFormAction = async (formData) => {
    try {
      const result = await formAction(formData);

      // If submission was successful (no error), mark images as used
      if (!result?.error && markImagesAsUsedRef.current) {
        markImagesAsUsedRef.current();
      }

      return result;
    } catch (error) {
      console.error("Form submission error:", error);
      // Don't mark as used if there was an error
      throw error;
    }
  };

  return (
    <form className={styles.formBox} action={enhancedFormAction}>
      <p className={styles.posterName}>{user.name}</p>
      {state.error && <div className={styles.errorDiv}>{state.error}</div>}
      <input
        className={styles.titleInput}
        type="text"
        placeholder="Post Title"
        name="title"
        defaultValue={initialTitle}
        required
        disabled={isPending}
      />
      <textarea
        className={styles.contentInput}
        placeholder="Write your post here..."
        name="text"
        defaultValue={initialText}
        required
        disabled={isPending}
      />
      <ImageUpload
        isPending={isPending}
        onMarkAsUsedReady={handleMarkAsUsedReady}
        initialImages={initialImages}
      />
      <button
        type="submit"
        className={styles.submitButton}
        disabled={isPending}
      >
        {isPending ? <Spinner /> : submitButtonText}
      </button>
    </form>
  );
}
