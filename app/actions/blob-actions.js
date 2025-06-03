"use server";

import { put, del } from "@vercel/blob";

export async function uploadImage(image) {
  try {
    if (!image || image.size === 0) {
      return { error: "No file provided" };
    }

    const timestamp = Date.now();
    const filename = `post-${timestamp}-${image.name}`;

    const blob = await put(filename, image, {
      access: "public",
      contentType: image.type,
    });

    return { url: blob.url, size: image.size, error: null };
  } catch (error) {
    console.error("Upload error:", error);
    return { error: "Upload failed" };
  }
}

export async function deleteImage(url) {
  try {
    await del(url);
  } catch (error) {
    console.error("Delete error:", error);
    return { error: "Delete failed" };
  }
}
