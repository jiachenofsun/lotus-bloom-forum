"use server";

import { Pool } from "pg";
import { deleteImage } from "@/app/actions/blob-actions";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function getPosts(site, page = 1, pageSize = 10) {
  try {
    const client = await pool.connect();
    const offset = (page - 1) * pageSize;

    const countResult = await client.query(
      "SELECT COUNT(*) FROM posts WHERE site = $1",
      [site],
    );
    const totalPosts = parseInt(countResult.rows[0].count);

    const result = await client.query(
      "SELECT * FROM posts WHERE site = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
      [site, pageSize, offset],
    );
    client.release();

    return {
      posts: result.rows,
      totalPosts,
      totalPages: Math.ceil(totalPosts / pageSize),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return {
      posts: [],
      totalPosts: 0,
      totalPages: 0,
      currentPage: page,
    };
  }
}

export async function addPost(author_id, site, title, body) {
  try {
    const client = await pool.connect();
    const result = await client.query(
      "INSERT INTO posts (author_id, site, title, body) VALUES ($1, $2, $3, $4) RETURNING id",
      [author_id, site, title, body],
    );
    client.release();
    return result.rows[0].id;
  } catch (error) {
    console.error("Error adding post:", error);
    throw error;
  }
}

/* Adds all post images to Vercel Blob and then adds them to the database. 
  If anything fails, it will rollback the transaction, 
  so no entries will be added to the database. */
export async function addPostImages(postId, blobs) {
  if (!blobs || blobs.length === 0) {
    return [];
  }

  try {
    const client = await pool.connect();
    const insertPromises = blobs.map(async (blob) => {
      const { url, size } = blob;

      const insertResult = await client.query(
        `
          INSERT INTO post_images (post_id, file_size_bytes, blob_url)
          VALUES ($1, $2, $3)
          RETURNING *
        `,
        [postId, size, url],
      );

      return insertResult.rows[0];
    });
    await Promise.all(insertPromises);
    client.release();
  } catch (error) {
    throw error;
  }
}

export async function editPost(post_id, title, body, blobs) {
  try {
    const client = await pool.connect();

    await client.query(
      "UPDATE posts SET title = $1, body = $2 WHERE id = $3 RETURNING *",
      [title, body, post_id],
    );

    // for all the entries in the old blobs that aren't in the new blobs, delete them from Vercel Blob
    const oldBlobs = await client.query(
      "SELECT blob_url FROM post_images WHERE post_id = $1",
      [post_id],
    );
    const oldBlobUrls = oldBlobs.rows.map((row) => row.blob_url);
    const newBlobUrls = blobs.map((blob) => blob.url);

    const urlsToDelete = oldBlobUrls.filter(
      (url) => !newBlobUrls.includes(url),
    );
    await Promise.all(urlsToDelete.map((url) => deleteImage(url)));

    // Delete all existing entries and add new entries
    await client.query("DELETE FROM post_images WHERE post_id = $1", [post_id]);
    const insertPromises = blobs.map(async (blob) => {
      const { url, size } = blob;

      const insertResult = await client.query(
        `
          INSERT INTO post_images (post_id, file_size_bytes, blob_url)
          VALUES ($1, $2, $3)
          RETURNING *
        `,
        [post_id, size, url],
      );

      return insertResult.rows[0];
    });
    await Promise.all(insertPromises);

    client.release();
  } catch (error) {
    console.error("Error editing post:", error);
    throw error;
  }
}

export async function getPostById(post_id) {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM posts WHERE id = $1", [
      post_id,
    ]);
    // Get all images for this post
    const imagesResult = await client.query(
      "SELECT blob_url, file_size_bytes FROM post_images WHERE post_id = $1",
      [post_id],
    );
    client.release();
    const post = result.rows[0];
    if (!post) return null;
    post.blobs = imagesResult.rows.map((row) => {
      return {
        url: row.blob_url,
        size: row.file_size_bytes,
      };
    });
    return post;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export async function deletePost(post_id) {
  try {
    const client = await pool.connect();

    const result = await client.query("DELETE FROM posts WHERE id = $1", [
      post_id,
    ]);
    // delete all urls from Vercel Blob
    const imagesResult = await client.query(
      "SELECT blob_url FROM post_images WHERE post_id = $1",
      [post_id],
    );
    const blobUrls = imagesResult.rows.map((row) => row.blob_url);
    await Promise.all(blobUrls.map((url) => deleteImage(url)));

    client.release();
    return result.rows;
  } catch (error) {
    console.error("Error deleting post:", error);
    return 0;
  }
}

export async function getComments(postid, page = 1, pageSize = 10) {
  try {
    const client = await pool.connect();
    const offset = (page - 1) * pageSize;

    const countResult = await client.query(
      "SELECT COUNT(*) FROM comments WHERE post_id = $1",
      [postid],
    );
    const totalComments = parseInt(countResult.rows[0].count);

    const result = await client.query(
      "SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at LIMIT $2 OFFSET $3",
      [postid, pageSize, offset],
    );
    client.release();

    return {
      comments: result.rows,
      totalComments,
      totalPages: Math.ceil(totalComments / pageSize),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching comments:", error);
    return {
      comments: [],
      totalComments: 0,
      totalPages: 0,
      currentPage: page,
    };
  }
}

export async function postComments(postid, authorid, text) {
  try {
    const client = await pool.connect();
    const result = await client.query(
      "INSERT INTO comments (post_id, author_id, text) values ($1, $2, $3) returning *",
      [postid, authorid, text],
    );
    client.release();
    return result.rows;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}
export async function deleteComments(id) {
  try {
    const client = await pool.connect();
    const result = await client.query("DELETE FROM comments WHERE id = $1", [
      id,
    ]);
    client.release();
    return result.rows;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}
export async function editComments(id, text) {
  try {
    const client = await pool.connect();
    const result = await client.query(
      "update comments set text = $1 where id = $2 returning *",
      [text, id],
    );
    client.release();
    return result.rows;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}
