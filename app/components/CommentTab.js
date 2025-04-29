"use client";

import { useState } from "react";
import styles from "./CommentTab.module.css";
import {
  postComments,
  deleteComments,
  editComments,
} from "@/app/actions/db-actions";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function CommentTab({ comments, postid }) {
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const { user } = useUser();

  async function handleSubmit() {
    if (newComment.trim() === "") return;

    const result = await postComments(postid, user.sub, newComment.trim());
    //setComments([...comments, newEntry]);
    setNewComment("");
  }

  async function handleDelete(id) {
    const result = await deleteComments(id);
  }
  function handleEdit(comment) {
    setEditingCommentId(comment.id);
    setEditingText(comment.text);
  }
  async function handleSaveEdit() {
    if (editingText.trim() === "") return;

    // Call your API to update
    const result = await editComments(editingCommentId, editingText.trim());

    // After saving, clear edit state
    setEditingCommentId(null);
    setEditingText("");
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
                <div className={styles.commentButtons}>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(comment.id)}
                  >
                    <img
                      src="/x.png"
                      alt="Delete"
                      className={styles.deleteIcon}
                    />
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleEdit(comment)}
                  >
                    <img
                      src="/pencil.png"
                      alt="Delete"
                      className={styles.deleteIcon}
                    />
                  </button>
                </div>
              </div>
              {editingCommentId === comment.id ? (
                <div className={styles.editWindow}>
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className={styles.textarea}
                  />
                  <button onClick={handleSaveEdit}>Save</button>
                  <button onClick={() => setEditingCommentId(null)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <p>{comment.text}</p>
              )}
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
