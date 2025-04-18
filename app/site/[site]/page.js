/*
 * TODO:
 * 1a. Add a list of posts for the site
 * 1b. display some error message if the site doesn't exist/is invalid
 * 2. Add a way to create a new post
 *  - this can maybe be through a separate page (eg. /:site/new)
 */

import DiscussionBoardPost from "@/app/components/DiscussionBoardPost";
import NewPostButton from "@/app/components/new-post-button";
import styles from "./page.module.css";
import { getPosts } from "@/app/actions/db-actions";
import { getUserName, getUserRoles } from "@/app/actions/role-actions";

export default async function SitePage({ params }) {
  const p = await params;
  const site = p.site;
  const posts = await getPosts(site);

  // Fetch user names and roles for all posts
  const postsWithUserInfo = await Promise.all(
    posts.map(async (post) => {
      const userName = await getUserName(post.author_id);
      const userRoles = await getUserRoles({ sub: post.author_id });
      return { ...post, userName, userRoles };
    }),
  );

  return (
    <div>
      <div className={styles.wholePage}>
        <div className={styles.sidebar}>
          <h1 className={styles.h1}>General</h1>
          <NewPostButton site={site} />
          <div className={styles.navButtons}>
            <button className={styles.navButton}>
              San Antonio Family Resource Center
            </button>
            <button className={styles.navButton}>Lotus Bloom Downtown</button>
            <button className={styles.navButton}>
              Room to Bloom East Oakland
            </button>
            <button className={styles.navButton}>Family Navigation</button>
          </div>
        </div>
        <div className={styles.postList}>
          {postsWithUserInfo.map((post) => (
            <DiscussionBoardPost
              key={post.id}
              site={site}
              name={post.userName}
              title={post.title}
              roles={post.userRoles}
            />
          ))}
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
