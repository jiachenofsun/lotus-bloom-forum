import { redirect } from "next/navigation";
import styles from "./page.module.css";
import { getSession } from "@auth0/nextjs-auth0";
import { addPost } from "@/app/actions/db-actions";
export default async function NewPostPage({ params }) {
  const p = await params;
  const site = p.site;

  const session = await getSession();
  const { user } = session;

  async function handleSubmit(formData) {
    "use server"; // very important for server actions!

    const id = user.sub;
    const title = formData.get("title");
    const text = formData.get("text");

    console.log("title", title);
    console.log("text", text);

    await addPost(id, site, title, text);

    redirect(`/site/${site}`); // after submitting, go back to the site page
  }

  return (
    <div>
      <div className={styles.container}>
        <form className={styles.formBox} action={handleSubmit}>
          <p className={styles.posterName}>{user.name}</p>
          <input
            className={styles.titleInput}
            type="text"
            placeholder="Post Title"
            name="title"
            required
          />
          <textarea
            className={styles.contentInput}
            placeholder="Write your post here..."
            name="text"
            required
          />
          <button type="submit" className={styles.submitButton}>
            Submit Post
          </button>
        </form>
      </div>
    </div>
  );
}
