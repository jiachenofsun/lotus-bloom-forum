"use client";

import styles from "./DeletePostButton.module.css";
import { deletePost } from "../actions/db-actions";

export default function DeletePostButton({ post_id }) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        console.log(post_id);
        deletePost(post_id);
      }}
      className={styles.imageButton}
    >
      {" "}
      <img src="/bin.png" alt="Delete" />
    </button>
  );
}
