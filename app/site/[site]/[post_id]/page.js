import Image from "next/image";
import styles from "./page.module.css";
import CommentTab from "@/app/components/CommentTab";
import { getPostById, getComments } from "@/app/actions/db-actions";
import { getUserDetails, getUserRoles } from "@/app/actions/role-actions";
import Link from "next/link";
import { getSession } from "@auth0/nextjs-auth0";

export default async function PostPage({ params, searchParams }) {
  const p = await params;
  const sp = await searchParams;
  const site = p.site;
  const post_id = p.post_id;
  const currentPage = Number(sp?.page) || 1;
  const pageSize = 10;

  const post = await getPostById(post_id);
  if (!post) {
    return <p>Post not found.</p>;
  }

  const { name: authorName, roles: authorRoles } = await getUserDetails(
    post.author_id,
  );
  const nonStandardRole = authorRoles?.find((role) => role !== "Standard");

  const createdAt = new Date(post.created_at).toLocaleDateString();

  const {
    comments,
    totalPages,
    currentPage: page,
  } = await getComments(post_id, currentPage, pageSize);
  const commentsWithName = await Promise.all(
    comments.map(async (comment) => {
      const { name: userName, roles: userRoles } = await getUserDetails(
        comment.author_id,
      );
      return { ...comment, userName, userRoles };
    }),
  );

  // get current user's details
  const session = await getSession();
  const { user } = session;
  const current_user_roles = await getUserRoles(user);

  return (
    <div>
      <div className={styles.pageContainer}>
        <div className={styles.links}>
          <div className={styles.backButton}>
            <a className={styles.backParent} href={`/site/${site}`}>
              <Image src={"/back2.svg"} alt="Back" width={40} height={40} />
              Back
            </a>
          </div>
        </div>

        <div className={styles.flexContainer}>
          <div className={styles.textbox}>
            <div className={styles.userTag}>
              <h1>{post.title}</h1>

              <div className={styles.userProfile}>
                <Image
                  src={"/default_profile.svg"}
                  alt="Back"
                  width={40}
                  height={40}
                />
                <div className={styles.userBox}>
                  <h1>{authorName} </h1>
                  {nonStandardRole && (
                    <div className={styles.roleTags}>
                      {nonStandardRole.toUpperCase()}
                    </div>
                  )}
                  <h2>{createdAt} </h2>
                </div>
              </div>
            </div>
            <p>{post.body}</p>
            {post.blobs.map((blob, index) => (
              <a
                href={blob.url}
                key={blob.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.imageLink}
              >
                <Image
                  src={blob.url}
                  alt={`Post Image ${index + 1}`}
                  width={400}
                  height={400}
                  className={styles.postImage}
                />
              </a>
            ))}
          </div>

          <div className={styles.commentsSection}>
            <CommentTab
              comments={commentsWithName}
              postid={post_id}
              current_user={user}
              current_user_roles={current_user_roles}
            />

            {/* Pagination Controls */}
            <div className={styles.pagination}>
              {page > 1 && (
                <Link
                  href={`/site/${site}/${post_id}?page=${page - 1}`}
                  className={styles.paginationButton}
                >
                  Previous
                </Link>
              )}
              <span className={styles.pageInfo}>
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/site/${site}/${post_id}?page=${page + 1}`}
                  className={styles.paginationButton}
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// This is needed for the page to receive the params prop
export async function generateMetadata({ params }) {
  const p = await params;
  return {
    title: `Post ID: ${p.post_id} on ${p.site}`,
  };
}
