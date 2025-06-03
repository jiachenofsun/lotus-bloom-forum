"use client";

import { useState } from "react";
import { addReaction, removeReaction } from "@/app/actions/db-actions";

export default function LikeButton({
  postId,
  isInitiallyLiked,
  initialLikeCount,
  current_user_id,
}) {
  const [liked, setLiked] = useState(isInitiallyLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);

  const toggleLike = async () => {
    if (loading) return; // prevent double click
    setLoading(true);

    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev) => prev + (newLiked ? 1 : -1)); // optimistic update

    let res;
    if (newLiked) {
      res = await addReaction(postId, current_user_id);
    } else {
      res = await removeReaction(postId, current_user_id);
    }

    if (!res.success) {
      console.error("Reaction failed");
      setLiked(!newLiked);
      setLikeCount((prev) => prev - (newLiked ? 1 : -1));
    }

    setLoading(false);
  };

  return (
    <div
      onClick={toggleLike}
      style={{ cursor: "pointer", textAlign: "center" }}
    >
      <svg
        width={25}
        height={25}
        viewBox="0 0 24 24"
        fill={liked ? "#ef4444" : "none"}
        stroke={liked ? "#ef4444" : "#000000"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <p style={{ margin: 0 }}>{likeCount}</p>
    </div>
  );
}
