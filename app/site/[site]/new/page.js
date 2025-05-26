import { redirect } from "next/navigation";
import styles from "./page.module.css";
import { getSession } from "@auth0/nextjs-auth0";
import { addPost, addPostImages, deletePost } from "@/app/actions/db-actions";
import PostForm from "@/app/components/PostForm";

export default async function NewPostPage({ params }) {
  const p = await params;
  const site = p.site;
  const session = await getSession();
  const { user } = session;

  async function handleSubmit(prevState, formData) {
    "use server";

    let postId;
    const session = await getSession();
    const { user } = session;

    const id = user.sub;
    const title = formData.get("title");
    const text = formData.get("text");
    const imageUrls = formData.getAll("imageUrls");
    const imageSizes = formData.getAll("imageSizes");
    const blobs = imageUrls.map((url, i) => ({
      url,
      size: imageSizes[i],
    }));
    try {
      postId = await addPost(id, site, title, text);
      if (blobs.length > 0) {
        await addPostImages(postId, blobs);
      }
    } catch (error) {
      if (postId) {
        await deletePost(postId);
      }
      return { error: "Failed to create post. Please try again." };
    }
    if (postId) {
      redirect(`/site/${site}/${postId}`);
    }
    return { error: null };
  }

  return (
    <div>
      <div className={styles.container}>
        <PostForm user={user} site={site} handleSubmit={handleSubmit} />
      </div>
    </div>
  );
}
