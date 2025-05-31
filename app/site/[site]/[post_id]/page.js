import Image from "next/image";
import styles from "./page.module.css";
import CommentTab from "@/app/components/CommentTab";
import {
  getPostById,
  getComments,
  getIfUserLikedPost,
  getNumLikes,
} from "@/app/actions/db-actions";
import { getUserDetails } from "@/app/actions/role-actions";
import Link from "next/link";
import LikeButton from "@/app/components/LikeButton";
import { getSession } from "@auth0/nextjs-auth0";

export default async function PostPage({ params, searchParams }) {
  const p = await params;
  const sp = await searchParams;
  const site = p.site;
  const post_id = p.post_id;
  const num_likes = await getNumLikes(post_id);
  const session = await getSession(); // server-side auth
  const userId = session?.user?.sub;
  const isLiked = userId ? await getIfUserLikedPost(post_id, userId) : false;
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

  return (
    <div>
      <div className={styles.pageContainer}>
        <div className={styles.links}>
          <div className={styles.backButton}>
            <a className={styles.backParent} href={`/site/${site}`}>
              <Image src={"/back2.svg"} alt="Back" width={40} height={40} />
              <h1>Back</h1>
            </a>
          </div>
        </div>

        <div className={styles.flexContainer}>
          <div className={styles.textbox}>
            <div className={styles.postheader}>
              <div className={styles.userTag}>
                <div className={styles.userProfile}>
                  <Image
                    src={"/default_profile.svg"}
                    alt="Back"
                    width={40}
                    height={40}
                  />
                  <div className={styles.userBox}>
                    <h2>{authorName} </h2>
                    {nonStandardRole && (
                      <div className={styles.roleTags}>
                        {nonStandardRole.toUpperCase()}
                      </div>
                    )}
                    <h3>{createdAt} </h3>
                  </div>
                </div>

                <div className={styles.likedisplay}>
                  <LikeButton
                    postId={post_id}
                    isInitiallyLiked={isLiked}
                    initialLikeCount={num_likes}
                  />
                </div>
              </div>
              <h1>{post.title}</h1>
            </div>

            <p>{post.body}</p>
          </div>

          <div className={styles.commentsSection}>
            <CommentTab comments={commentsWithName} postid={post_id} />

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
