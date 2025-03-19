/*
 * TODO:
 * 1a. Display a list of comments for the post
 * 1b. Display some error message if the post_id doesn't exist/is invalid (just hardcode valid/invalid post_ids for now)
 * 2a. Add a way to create a new comment
 * 2b. Add a way to delete and edit a comment
 * 2c. Add a way to delete and edit a post (only for a user who made the post (worry about the functionality of this later once we do backend))
 */

export default async function PostPage({ params }) {
  const p = await params;
  const site = p.site;
  const post_id = p.post_id;

  return (
    <div>
      <h1>Post ID: {post_id}</h1>
      <div>
        <h2>hi</h2>
        <p>
          This is the page for {post_id} on {site}
        </p>
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
