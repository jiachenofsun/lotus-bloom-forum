import { redirect } from "next/navigation";
import styles from "./page.module.css";
import { getSession } from "@auth0/nextjs-auth0";
import { editPost, getPostById } from "@/app/actions/db-actions";
import PostForm from "@/app/components/PostForm";
import Image from "next/image";

export default async function EditPage({ params }) {
  const p = await params;
  const site = p.site;
  const post_id = p.post_id;

  const session = await getSession();
  const { user } = session;

  const post = await getPostById(post_id);

  async function handleSubmit(prevState, formData) {
    "use server";

    const title = formData.get("title");
    const text = formData.get("text");
    const imageUrls = formData.getAll("imageUrls");
    const imageSizes = formData.getAll("imageSizes");
    const blobs = imageUrls.map((url, i) => ({
      url,
      size: imageSizes[i],
    }));
    try {
      await editPost(Number(post_id), title, text, blobs);
    } catch (error) {
      return { error: "Failed to edit post. Please try again." };
    }
    redirect(`/site/${site}/${post_id}`);
  }

  return (
    <div className={styles.outerContainer}>
      <div className={styles.container}>
        <div className={styles.links}>
          <div className={styles.backButton}>
            <a className={styles.backParent} href={`/site/${site}`}>
              <Image src={"/back2.svg"} alt="Back" width={40} height={40} />
              Back
            </a>
          </div>
        </div>
        <PostForm
          user={user}
          site={site}
          handleSubmit={handleSubmit}
          initialTitle={post?.title}
          initialText={post?.body}
          initialImages={post?.blobs}
          submitButtonText="Save Changes"
          successMessage="Post updated successfully"
        />
      </div>
    </div>
  );
}
