"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./CommentTab.module.css";
import {
  postComments,
  deleteComments,
  editComments,
} from "@/app/actions/db-actions";

export default function CommentTab({
  comments,
  postid,
  current_user,
  current_user_roles,
}) {
  const [localComments, setLocalComments] = useState(comments);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");

  async function handleSubmit() {
    if (newComment.trim() === "") return;
    const result = await postComments(
      postid,
      current_user.sub,
      newComment.trim(),
    );
    if (result.length > 0) {
      const newPostedComment = result[0];

      setLocalComments((prev) => [
        ...prev,
        {
          ...newPostedComment,
          userName: current_user.name,
          userRoles: current_user_roles,
          created_at: new Date(newPostedComment.created_at),
        },
      ]);
    }
    setNewComment("");
  }

  async function handleDelete(id) {
    const previousComments = localComments;
    setLocalComments((prev) => prev.filter((comment) => comment.id !== id));

    try {
      await deleteComments(id);
    } catch (error) {
      console.error("Failed to delete comment:", error);
      setLocalComments(previousComments);
    }
  }

  function handleEdit(comment) {
    setEditingCommentId(comment.id);
    setEditingText(comment.text);
  }
  async function handleSaveEdit() {
    if (editingText.trim() === "") return;
    const result = await editComments(editingCommentId, editingText.trim());
    if (result.length > 0) {
      const updatedComment = result[0];

      setLocalComments((prev) =>
        prev.map((comment) => {
          if (comment.id === updatedComment.id) {
            return {
              ...updatedComment,
              userName: comment.userName,
              userRoles: comment.userRoles,
            };
          }
          return comment;
        }),
      );
    }
    setEditingCommentId(null);
    setEditingText("");
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  const isCurrentUserAdmin = current_user_roles.includes("Admin");

  return (
    <div className={styles.commentTabContainer}>
      <h2 className={styles.header}>Comments</h2>
      <div className={styles.commentProfile}>
        <div className={styles.commentsList}>
          {localComments.length === 0 ? (
            <div className={styles.noComments}>
              <h3>No comments yet</h3>
              <p>Be the first to join the discussion!</p>
            </div>
          ) : (
            localComments.map((comment) => (
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
                  <div className={styles.commentDateAndButtons}>
                    <h4>{comment.created_at.toDateString()}</h4>
                    {/* Only display edit delete buttons if authorized */}
                    {(isCurrentUserAdmin ||
                      comment.author_id === current_user.sub) && (
                      <>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDelete(comment.id)}
                        >
                          <Image
                            src="/x.png"
                            alt="Delete"
                            width={24}
                            height={24}
                            className={styles.deleteIcon}
                          />
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleEdit(comment)}
                        >
                          <Image
                            src="/pencil.png"
                            alt="Edit"
                            width={24}
                            height={24}
                            className={styles.deleteIcon}
                          />
                        </button>
                      </>
                    )}
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
            ))
          )}
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
