"use client";

import { useState } from "react";
import styles from "./CommentTab.module.css";

export default function CommentTab() {
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "Deven Mital",
      date: "March 1, 2025",
      text: "This is the first comment.",
    },
    {
      id: 2,
      author: "Deven Mital",
      date: "March 1, 2025",
      text: "Another comment here!",
    },
  ]);
  const [newComment, setNewComment] = useState("");

  const handleSubmit = () => {
    if (newComment.trim() === "") return;

    const newEntry = {
      id: Date.now(),
      author: "Deven Mital", // Hardcoded for now
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      text: newComment.trim(),
    };

    setComments([...comments, newEntry]);
    setNewComment("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className={styles.commentTabContainer}>
      <h2 className={styles.header}>Comments</h2>
      <div className={styles.commentProfile}>
        <div className={styles.commentsList}>
          {comments.map((comment) => (
            <div key={comment.id} className={styles.commentBox}>
              <div className={styles.commentTag}>
                <h3>{comment.author}</h3>
                <h4>{comment.date}</h4>
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
