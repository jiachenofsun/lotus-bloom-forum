"use client";

import styles from "./DeletePostButton.module.css";
import { deletePost } from "../actions/db-actions";

export default function DeletePostButton({ post_id }) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        deletePost(post_id);
      }}
      className={styles.imageButton}
    >
      {" "}
      <img src="/trash.png" alt="Delete" />
    </button>
  );
}
