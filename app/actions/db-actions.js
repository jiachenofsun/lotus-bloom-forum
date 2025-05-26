"use server";

import { Pool } from "pg";
import { put, del } from "@vercel/blob";

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
  so no images will be added to Vercel Blob nor the database. */
export async function addPostImages(postId, images) {
  console.log("Adding post images to Vercel Blob", images);
  if (!images || images.length === 0) {
    return [];
  }

  const uploadedBlobs = [];

  try {
    // Upload all images to Vercel Blob in parallel
    const uploadPromises = images.map(async (image, index) => {
      const timestamp = Date.now();
      const fileExtension = image.name.split(".").pop();
      const filename = `post-${postId}-${timestamp}-${index}.${fileExtension}`;

      const blob = await put(filename, image, {
        access: "public",
        addRandomSuffix: false,
        contentType: image.type,
      });

      return {
        blob,
        fileSize: image.size,
        originalIndex: index,
      };
    });

    const uploadResults = await Promise.all(uploadPromises);
    uploadedBlobs.push(...uploadResults);

    const client = await pool.connect();
    // Begin database transaction
    await client.query("BEGIN");

    try {
      // Insert all records into post_images table
      const insertPromises = uploadResults.map(async (result) => {
        const { blob, fileSize } = result;

        const insertResult = await client.query(
          `
          INSERT INTO post_images (post_id, file_size_bytes, blob_url)
          VALUES ($1, $2, $3)
          RETURNING *
        `,
          [postId, fileSize, blob.url],
        );

        return insertResult.rows[0];
      });

      await Promise.all(insertPromises);
      await client.query("COMMIT");
      client.release();
    } catch (dbError) {
      await client.query("ROLLBACK");
      client.release();
      throw dbError;
    }
  } catch (error) {
    console.log("Error in addPostImages:", error);
    // Clean up: Delete any successfully uploaded blobs
    if (uploadedBlobs.length > 0) {
      const cleanupPromises = uploadedBlobs.map(async (result) => {
        try {
          await del(result.blob.url);
        } catch (cleanupError) {
          console.error(
            "Error cleaning up blob:",
            result.blob.url,
            cleanupError,
          );
          // Log but don't throw - we don't want cleanup errors to mask the original error
        }
      });

      // Wait for cleanup to complete (with timeout)
      try {
        await Promise.allSettled(cleanupPromises);
      } catch (cleanupError) {
        console.error("Error during blob cleanup:", cleanupError);
      }
    }

    // Re-throw the original error
    throw new Error(`Failed to add post images: ${error.message}`);
  }
}

export async function editPost(post_id, title, body) {
  try {
    const client = await pool.connect();

    const result = await client.query(
      "UPDATE posts SET title = $1, body = $2 WHERE id = $3 RETURNING *",
      [title, body, post_id],
    );

    client.release();

    console.log("Update result:", result.rows);
    return result.rows;
  } catch (error) {
    console.error("Error editing post:", error);
    return [];
  }
}

export async function getPostById(post_id) {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM posts WHERE id = $1", [
      post_id,
    ]);
    client.release();
    return result.rows[0]; // return the first (and only) post
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
