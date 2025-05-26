"use client";

import { useState } from "react";
import styles from "./ImageUpload.module.css";
import Image from "next/image";
const MAX_FILES = 3;
const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

export default function ImageUpload() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState("");

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Only JPG and PNG files are allowed";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File size must be less than 1MB";
    }
    return null;
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setError("");

    if (selectedFiles.length + files.length > MAX_FILES) {
      setError(`You can only upload a maximum of ${MAX_FILES} images`);
      return;
    }

    const validFiles = [];
    const newPreviews = [];

    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      validFiles.push(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push({
          id: Math.random().toString(36).substr(2, 9),
          url: e.target.result,
          file: file,
        });

        if (newPreviews.length === validFiles.length) {
          setPreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const removeImage = (indexToRemove) => {
    setSelectedFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
    setPreviews((prev) => prev.filter((_, index) => index !== indexToRemove));
    setError("");
  };

  return (
    <div className={styles.imageUploadContainer}>
      <div className={styles.uploadSection}>
        <label className={styles.uploadLabel}>
          Add Images (Max 3, JPG/PNG, under 1MB each)
        </label>
        <input
          type="file"
          id="images"
          name="images"
          multiple
          accept=".jpg,.jpeg,.png"
          onChange={handleFileChange}
          className={styles.fileInput}
          disabled={selectedFiles.length >= MAX_FILES}
        />

        {error && <div className={styles.errorMessage}>{error}</div>}
      </div>

      {previews.length > 0 && (
        <div className={styles.previewContainer}>
          <h4 className={styles.previewTitle}>Selected Images:</h4>
          <div className={styles.previewGrid}>
            {previews.map((preview, index) => (
              <div key={preview.id} className={styles.previewItem}>
                <Image
                  src={preview.url}
                  alt={`Preview ${index + 1}`}
                  className={styles.previewImage}
                  width={100}
                  height={100}
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className={styles.removeButton}
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
