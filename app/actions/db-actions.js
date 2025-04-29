"use server";

import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function getPosts(site) {
  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT * FROM posts WHERE site = $1 ORDER BY created_at DESC",
      [site],
    );
    client.release();
    return result.rows;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export async function getComments(postid) {
  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at",
      [postid],
    );
    client.release();
    return result.rows;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
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
