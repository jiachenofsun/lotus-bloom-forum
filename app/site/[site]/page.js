import Link from "next/link";
import DiscussionBoardPost from "@/app/components/DiscussionBoardPost";
import NewPostButton from "@/app/components/new-post-button";
import styles from "./page.module.css";
import { getPosts } from "@/app/actions/db-actions";
import { getUserDetails } from "@/app/actions/role-actions";
import { sites } from "@/app/constants";

export default async function SitePage({ params }) {
  const p = await params;
  const site = p.site;
  const posts = await getPosts(site);

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
          <NewPostButton site={site} />
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
          {postsWithUserInfo.map((post) => (
            <DiscussionBoardPost
              key={post.id}
              site={site}
              name={post.userName}
              title={post.title}
              roles={post.userRoles}
              post_id={post.id}
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
