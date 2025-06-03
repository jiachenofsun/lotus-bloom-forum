"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { uploadImage, deleteImage } from "@/app/actions/blob-actions";
import styles from "./ImageUpload.module.css";

const MAX_FILES = 3;
const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

export default function ImageUpload({
  isPending,
  onMarkAsUsedReady,
  initialImages = [],
}) {
  const [images, setImages] = useState(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const newlyUploadedUrlsRef = useRef(new Set());
  const shouldCleanupRef = useRef(true);
  const initialImageUrlsRef = useRef(new Set());

  useEffect(() => {
    initialImages.forEach((img) => {
      if (img.url) {
        initialImageUrlsRef.current.add(img.url);
      }
    });
  }, [initialImages]);

  // Track ONLY newly uploaded URLs for cleanup (i.e. exclude initial images)
  useEffect(() => {
    images.forEach((img) => {
      if (img.url && !initialImageUrlsRef.current.has(img.url)) {
        newlyUploadedUrlsRef.current.add(img.url);
      }
    });
  }, [images]);

  // Method to mark images as "used" - prevents cleanup
  const markImagesAsUsed = () => {
    shouldCleanupRef.current = false;
    newlyUploadedUrlsRef.current.clear();
  };

  // Pass the markImagesAsUsed function to parent
  useEffect(() => {
    if (onMarkAsUsedReady) {
      onMarkAsUsedReady(markImagesAsUsed);
    }
  }, [onMarkAsUsedReady]);

  // Cleanup on unmount or page leave - ONLY newly uploaded images
  useEffect(() => {
    const cleanup = async () => {
      if (!shouldCleanupRef.current) {
        return;
      }

      const urlsToDelete = Array.from(newlyUploadedUrlsRef.current);
      if (urlsToDelete.length > 0) {
        try {
          await Promise.all(urlsToDelete.map((url) => deleteImage(url)));
        } catch (err) {
          console.error("Image cleanup failed:", err);
        }
      }
    };

    const handleBeforeUnload = () => {
      // Best effort cleanup - may not complete due to browser limitations
      if (shouldCleanupRef.current) {
        cleanup();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      cleanup();
    };
  }, []);

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Only JPG and PNG files are allowed";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File size must be less than 1MB";
    }
    return null;
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    setError("");

    if (images.length + files.length > MAX_FILES) {
      setError(`You can only upload a maximum of ${MAX_FILES} images`);
      return;
    }

    const validFiles = [];
    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      validFiles.push(file);
    }

    setIsUploading(true);

    try {
      const uploadPromises = validFiles.map(async (file) => {
        const result = await uploadImage(file);
        if (result.error) {
          throw new Error(result.error);
        }

        return {
          id: crypto.randomUUID(),
          url: result.url,
          fileName: file.name,
          size: file.size,
          isNew: true, // DEBUGGING ONLY FLAG to identify newly uploaded images
        };
      });

      const newImages = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...newImages]);

      // Clear file input
      e.target.value = "";
    } catch (error) {
      setError(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = async (indexToRemove) => {
    const imageToRemove = images[indexToRemove];

    if (!imageToRemove) return;

    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));

    // Only clean up from blob storage if it's a newly uploaded image
    // Do not delete initial images from storage
    if (
      imageToRemove.url &&
      !imageToRemove.url.startsWith("blob:") &&
      !initialImageUrlsRef.current.has(imageToRemove.url)
    ) {
      try {
        await deleteImage(imageToRemove.url);
        newlyUploadedUrlsRef.current.delete(imageToRemove.url);
      } catch (err) {
        console.error("Failed to delete image from blob storage:", err);
      }
    }

    setError("");
  };

  return (
    <div className={styles.imageUploadContainer}>
      <div className={styles.uploadSection}>
        <label className={styles.uploadLabel}>
          Add Images (Max {MAX_FILES}, JPG/PNG, under 1MB each)
        </label>

        <input
          type="file"
          id="images"
          name="images"
          multiple
          accept=".jpg,.jpeg,.png"
          onChange={handleFileChange}
          className={styles.fileInput}
          disabled={images.length >= MAX_FILES || isUploading || isPending}
        />

        {isUploading && (
          <div className={styles.uploadingMessage}>Uploading images...</div>
        )}

        {error && <div className={styles.errorMessage}>{error}</div>}
      </div>

      {images.length > 0 && (
        <div className={styles.previewContainer}>
          <div className={styles.previewHeader}>
            <h4 className={styles.previewTitle}>
              Selected Images ({images.length}/{MAX_FILES}):
            </h4>
          </div>

          <div className={styles.previewGrid}>
            {images.map((image, index) => (
              <div key={index} className={styles.previewItem}>
                <div className={styles.imageWrapper}>
                  <Image
                    src={image.url}
                    alt={`Preview ${index + 1}`}
                    className={styles.previewImage}
                    width={120}
                    height={120}
                    style={{ objectFit: "cover" }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className={styles.removeButton}
                    aria-label={`Remove ${image.fileName || `image ${index + 1}`}`}
                    disabled={isUploading}
                  >
                    ×
                  </button>
                </div>
                {image.fileName && (
                  <span className={styles.fileName} title={image.fileName}>
                    {image.fileName.length > 15
                      ? `${image.fileName.substring(0, 12)}...`
                      : image.fileName}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden inputs for form submission */}
      {images.map((image, index) => (
        <div key={index}>
          <input type="hidden" name="imageUrls" value={image.url} />
          <input type="hidden" name="imageSizes" value={image.size} />
        </div>
      ))}
    </div>
  );
}
