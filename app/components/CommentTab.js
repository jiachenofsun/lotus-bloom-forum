"use client";

import { useState } from "react";
import styles from "./CommentTab.module.css";
import { postComments } from "@/app/actions/db-actions";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function CommentTab({ comments, postid }) {
  const [newComment, setNewComment] = useState("");
  const { user } = useUser();

  async function handleSubmit() {
    if (newComment.trim() === "") return;

    // const newEntry = {
    //   id: Date.now(),
    //   author: user.name, // Hardcoded for now
    //   date: new Date().toLocaleDateString("en-US", {
    //     year: "numeric",
    //     month: "long",
    //     day: "numeric",
    //   }),
    //   text: newComment.trim(),
    // };

    const result = await postComments(postid, user.sub, newComment.trim());
    //setComments([...comments, newEntry]);
    setNewComment("");
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  console.log("comments", comments);

  return (
    <div className={styles.commentTabContainer}>
      <h2 className={styles.header}>Comments</h2>
      <div className={styles.commentProfile}>
        <div className={styles.commentsList}>
          {comments.map((comment) => (
            <div key={comment.id} className={styles.commentBox}>
              <div className={styles.commentTag}>
                <h3>{comment.userName}</h3>
                <h4>{comment.created_at.toDateString()}</h4>
              </div>
              <p>{comment.text}</p>
            </div>
          ))}
        </div>

        <div className={styles.commentInput}>
          <textarea
            className={styles.textarea}
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button onClick={handleSubmit}>Post</button>
        </div>
      </div>
    </div>
  );
}
