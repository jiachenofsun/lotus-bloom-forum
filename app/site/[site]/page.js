import Link from "next/link";
import DiscussionBoardPost from "@/app/components/DiscussionBoardPost";
import NewPostButton from "@/app/components/new-post-button";
import styles from "./page.module.css";
import { getPosts } from "@/app/actions/db-actions";
import { getUserDetails } from "@/app/actions/role-actions";
import { sites } from "@/app/constants";
import { getSession } from "@auth0/nextjs-auth0";
import { getUserRoles } from "@/app/actions/role-actions";

export default async function SitePage({ params, searchParams }) {
  const p = await params;
  const sp = await searchParams;
  const site = p.site;
  const currentPage = Number(sp?.page) || 1;
  const pageSize = 10;
  const session = await getSession();
  const userRoles = session?.user ? await getUserRoles(session.user) : [];

  const {
    posts,
    totalPages,
    currentPage: page,
  } = await getPosts(site, currentPage, pageSize);

  const postsWithUserInfo = await Promise.all(
    posts.map(async (post) => {
      const { name: userName, roles: userRoles } = await getUserDetails(
        post.author_id,
      );
      return { ...post, userName, userRoles };
    }),
  );

  return (
    <div>
      <div className={styles.wholePage}>
        <div className={styles.sidebar}>
          <h1 className={styles.h1}>General</h1>
          <NewPostButton site={site} userRoles={userRoles} />
          <div className={styles.navButtons}>
            {sites.map((site) => (
              <Link
                key={site.url}
                href={`/site/${site.url}`}
                className={styles.navButton}
              >
                {site.name}
              </Link>
            ))}
          </div>
        </div>
        <div className={styles.postList}>
          {postsWithUserInfo.length === 0 ? (
            <div className={styles.noPosts}>
              <h2>No posts yet</h2>
              <p>Be the first to start a discussion!</p>
            </div>
          ) : (
            postsWithUserInfo.map((post) => (
              <DiscussionBoardPost
                key={post.id}
                site={site}
                name={post.userName}
                title={post.title}
                roles={post.userRoles}
                post_id={post.id}
              />
            ))
          )}

          {/* Pagination Controls */}
          {postsWithUserInfo.length > 0 && (
            <div className={styles.pagination}>
              {page > 1 && (
                <Link
                  href={`/site/${site}?page=${page - 1}`}
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
                  href={`/site/${site}?page=${page + 1}`}
                  className={styles.paginationButton}
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }) {
  const p = await params;
  return {
    title: `Site: ${p.site}`,
  };
}
