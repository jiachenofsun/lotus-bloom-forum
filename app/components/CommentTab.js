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

    const result = await editComments(editingCommentId, editingText.trim());

    setEditingCommentId(null);
    setEditingText("");
  }

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
                <div className={styles.nameID}>
                  <div className={styles.username}>{comment.userName}</div>
                  {(() => {
                    let nonStandardRole = null;

                    if (Array.isArray(comment.userRoles)) {
                      nonStandardRole = comment.userRoles.find(
                        (role) => role !== "Standard",
                      );
                    } else if (
                      typeof comment.userRoles === "string" &&
                      comment.userRoles !== "Standard"
                    ) {
                      nonStandardRole = comment.userRoles;
                    }

                    return nonStandardRole ? (
                      <div className={styles.roleTags}>
                        {nonStandardRole.toUpperCase()}
                      </div>
                    ) : null;
                  })()}
                </div>
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
