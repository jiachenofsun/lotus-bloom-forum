import styles from "./DiscussionBoardPost.module.css";
import { handleDeletePost } from "@/app/site/[site]/page.js";
import { deletePost } from "../actions/db-actions";
import DeletePostButton from "./DeletePostButton";
import EditPostButton from "./EditPostButton";

export default async function DiscussionBoardPost({
  site,
  name,
  title,
  roles,
  post_id,
}) {
  const nonStandardRole = roles?.find((role) => role !== "Standard");

  return (
    <div className={styles.postWrapper}>
      <form action={`/site/${site}/${post_id}`} style={{ display: "contents" }}>
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
        </button>
      </form>
      <div className={styles.editdelete}>
        <DeletePostButton post_id={post_id} />
        <EditPostButton site={site} post_id={post_id} />
      </div>
    </div>
  );
}
