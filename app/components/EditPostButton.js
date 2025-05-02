"use client";

import styles from "./EditPostButton.module.css";

export default function EditPostButton({ site, post_id }) {
  return (
    <form action={`/site/${site}/${post_id}/edit`}>
      <button className={styles.imageButton} type="submit">
        {" "}
        <img src="/pencil.png" alt="edit" />
      </button>
    </form>
  );
}
