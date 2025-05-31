"use client";

import { useState } from "react";
import Image from "next/image";
import redHeart from "@/public/redheart.png";
import blackHeart from "@/public/heart.png";

export default function LikeButton({
  postId,
  isInitiallyLiked,
  initialLikeCount,
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

    const res = await fetch("/api/reactions", {
      method: newLiked ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId }),
    });

    if (!res.ok) {
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
      <Image
        src={liked ? redHeart : blackHeart}
        alt="Like"
        width={25}
        height={25}
      />
      <p style={{ margin: 0 }}>{likeCount}</p>
    </div>
  );
}
