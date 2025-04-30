import styles from "./DiscussionBoardPost.module.css";
import { handleDeletePost } from "@/app/site/[site]/page.js";

export default async function DiscussionBoardPost({
  site,
  name,
  title,
  roles,
}) {
  // Finds the first non-standard role, if any
  const nonStandardRole = roles?.find((role) => role !== "Standard");

  return (
    <form action={`/site/${site}/123`} style={{ display: "contents" }}>
      <button className={styles.postButton}>
        <div className={styles.nameID}>
          <div className={styles.username}>{name}</div>
          {nonStandardRole && (
            <div className={styles.roleTags}>
              {nonStandardRole.toUpperCase()}
            </div>
          )}
        </div>
        <div className={styles.postTitle}>{title}</div>
        {/* <button onClick={handleDeletePost} className={styles.deleteButton}>
          Delete
        </button> */}
      </button>
    </form>
  );
}
