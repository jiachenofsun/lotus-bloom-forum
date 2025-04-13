/*
 * TODO:
 * 1a. Display a list of comments for the post
 * 1b. Display some error message if the post_id doesn't exist/is invalid (just hardcode valid/invalid post_ids for now)
 * 2a. Add a way to create a new comment
 * 2b. Add a way to delete and edit a comment
 * 2c. Add a way to delete and edit a post (only for a user who made the post (worry about the functionality of this later once we do backend))
 */

import Image from "next/image";
import styles from "./page.module.css";
import CommentTab from "@/app/components/CommentTab";

export default async function PostPage({ params }) {
  const p = await params;
  const site = p.site;
  const post_id = p.post_id;

  return (
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
          <div className={styles.userTag}>
            <h1>Welcome to Lotus Blooms Website</h1>

            <div className={styles.userProfile}>
              <Image
                src={"/default_profile.svg"}
                alt="Back"
                width={40}
                height={40}
              />
              <div className={styles.userBox}>
                <h1>Deven Mital </h1>
                <h2> March 1, 2025 </h2>
              </div>
            </div>
          </div>

          <p>
            Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque
            faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi
            pretium tellus duis convallis. Tempus leo eu aenean sed diam urna
            tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.
            Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut
            hendrerit semper vel class aptent taciti sociosqu. Ad litora
            torquent per conubia nostra inceptos himenaeos. Lorem ipsum dolor
            sit amet consectetur adipiscing elit. Quisque faucibus ex sapien
            vitae pellentesque sem placerat. In id cursus mi pretium tellus duis
            convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar
            vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa
            nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel
            class aptent taciti sociosqu. Ad litora torquent per conubia nostra
            inceptos himenaeos. Lorem ipsum dolor sit amet consectetur
            adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem
            placerat. In id cursus mi pretium tellus duis convallis. Tempus leo
            eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec
            metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer
            nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu.
            Ad litora torquent per conubia nostra inceptos himenaeos.Lorem ipsum
            dolor sit amet consectetur adipiscing elit. Quisque faucibus ex
            sapien vitae pellentesque sem placerat.
          </p>
          <img src={"/placeholder.jpg"} width="50%" />
        </div>

        <CommentTab />
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
