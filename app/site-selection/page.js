"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import styles from "./page.module.css";
import LogoutButton from "../components/logout-button";
import Link from "next/link";
import { getCurrentUser } from "../actions/role-actions";
import { sites } from "../constants";

export default function SiteSelection() {
  const router = useRouter();
  const { isLoading } = useUser();
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState("");
  const userName = useRef(null);

  useEffect(() => {
    async function checkProfileCompletion() {
      try {
        if (isLoading) return;

        setIsChecking(true);

        const { success, user, error } = await getCurrentUser();

        if (!success) {
          console.error("Failed to get current user:", error);
          setError("Error verifying profile status");
          setIsChecking(false);
          return;
        }

        // Check if name matches email (indicating incomplete profile)
        const nameMatchesEmail = user.name === user.email;

        if (nameMatchesEmail) {
          // Redirect to profile completion page if name matches email
          console.log("Redirecting to complete profile");
          router.push("/complete-profile");
        } else {
          userName.current = user.name;
          setIsChecking(false);
        }
      } catch (err) {
        console.error("Error checking profile:", err);
        setError("An error occurred while checking your profile");
        setIsChecking(false);
      }
    }

    checkProfileCompletion();
  }, [isLoading, router]);

  if (isLoading || isChecking) {
    return (
      <div className={styles.page}>
        <div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div>
          <h2>Something went wrong</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {userName.current && <p>Welcome, {userName.current}!</p>}
      <h1 className={styles.title}>Select a Site</h1>
      <div className={styles.selectionGrid}>
        {sites.map((site) => (
          <Link key={site.url} href={`/site/${site.url}`}>
            <div className={styles.site}>
              <div className={styles.siteTitle}>{site.name}</div>
              <p className={styles.siteDescription}>{site.description}</p>
            </div>
          </Link>
        ))}
      </div>
      <LogoutButton />
    </div>
  );
}
