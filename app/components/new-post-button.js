import styles from "./buttons.module.css";

export default function NewPostButton({ site, userRoles }) {
  const isAdmin = userRoles.includes("Lotus Bloom Admin");
  const isFamilyNavigator = userRoles.includes("Family Navigator");

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
