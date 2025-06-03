import styles from "./DiscussionBoardPost.module.css";
import DeletePostButton from "./DeletePostButton";
import EditPostButton from "./EditPostButton";
import Link from "next/link";

export default function DiscussionBoardPost({
  site,
  name,
  title,
  roles,
  author_id,
  current_user_id,
  current_user_roles,
  post_id,
}) {
  const nonStandardRole = roles?.find((role) => role !== "Standard");
  const isCurrentUserAdmin = current_user_roles.includes("Admin");

  return (
    <div className={styles.postWrapper}>
      <Link href={`/site/${site}/${post_id}`} className={styles.postButton}>
        <div className={styles.nameID}>
          <div className={styles.username}>{name}</div>
          {nonStandardRole && (
            <div className={styles.roleTags}>
              {nonStandardRole.toUpperCase()}
            </div>
          )}
        </div>
        <div className={styles.postTitle}>{title}</div>
      </Link>
      {/* Only display edit delete buttons if authorized */}
      {(isCurrentUserAdmin || current_user_id === author_id) && (
        <div className={styles.editdelete}>
          <DeletePostButton
            post_id={post_id}
            author_id={author_id}
            current_user_id={current_user_id}
            current_user_roles={current_user_roles}
          />
          <EditPostButton site={site} post_id={post_id} />
        </div>
      )}
    </div>
  );
}
