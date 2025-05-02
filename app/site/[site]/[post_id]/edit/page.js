import { redirect } from "next/navigation";
import styles from "./page.module.css";
import { getSession } from "@auth0/nextjs-auth0";
import { editPost, getPostById } from "@/app/actions/db-actions";

export default async function EditPage({ params }) {
  const { site, post_id } = params;

  const session = await getSession();
  const { user } = session;

  const post = await getPostById(post_id); // ← fetch the post data

  async function handleSubmit(formData) {
    "use server";

    const title = formData.get("title");
    const text = formData.get("text");

    await editPost(Number(post_id), title, text);
    redirect(`/site/${site}`);
  }

  return (
    <div>
      <div className={styles.container}>
        <form className={styles.formBox} action={handleSubmit}>
          <p className={styles.posterName}>{user.name}</p>
          <input
            className={styles.titleInput}
            type="text"
            name="title"
            required
            defaultValue={post?.title || ""}
          />
          <textarea
            className={styles.contentInput}
            name="text"
            required
            defaultValue={post?.body || ""}
          />
          <button type="submit" className={styles.submitButton}>
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
