import styles from "./buttons.module.css";

export default function NewPostButton({ site, current_user_roles }) {
  const isAdmin = current_user_roles.includes("Admin");
  const isFamilyNavigator = current_user_roles.includes("Family Navigator");

  const canPost =
    isAdmin ||
    (site !== "family-navigation" && site !== "lotus-bloom-general") ||
    isFamilyNavigator;

  return (
    <div>
      <form action={`/site/${site}/new`}>
        <button
          className={styles.newPostButton}
          type="submit"
          disabled={!canPost}
        >
          New Post
        </button>
      </form>
    </div>
  );
}
