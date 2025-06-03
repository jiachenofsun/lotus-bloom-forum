"use client";

import { useState, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import {
  assignRoleSelf,
  getUserRoles,
  setUserRole,
} from "../actions/role-actions";
import styles from "./EditRoles.module.css";

export default function EditRoles() {
  const { user, isLoading } = useUser();
  const [selectedRole, setSelectedRole] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [userRoles, setUserRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  useEffect(() => {
    async function fetchUserRoles() {
      if (user && user.sub) {
        setLoadingRoles(true);
        try {
          const roles = await getUserRoles(user);
          if (roles) {
            setUserRoles(roles);
          } else {
            console.error("Failed to fetch roles");
          }
        } catch (error) {
          console.error("Error fetching roles:", error);
        } finally {
          setLoadingRoles(false);
        }
      }
    }

    fetchUserRoles();
  }, [user]);

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRole) {
      setStatus("Please select a role");
      return;
    }

    setIsSubmitting(true);
    setStatus("Requesting role assignment...");

    try {
      const result = await assignRoleSelf(selectedRole);

      if (!result.success) {
        throw new Error(result.error || "Failed to assign role");
      }

      setStatus(
        `Success! The ${selectedRole} role has been assigned to your account.`,
      );
      setSelectedRole("");

      const updatedRoles = await getUserRoles(user);
      if (updatedRoles) {
        setUserRoles(updatedRoles);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveRole = async (roleToRemove) => {
    setIsSubmitting(true);
    setStatus(`Removing ${roleToRemove} role...`);

    try {
      const result = await setUserRole(user.sub, "None");

      if (!result.success) {
        throw new Error(result.error || "Failed to remove role");
      }

      setStatus(
        `Success! The ${roleToRemove} role has been removed from your account.`,
      );

      const updatedRoles = await getUserRoles(user);
      if (updatedRoles) {
        setUserRoles(updatedRoles);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  if (!user) {
    throw new Error("User should be authenticated");
  }

  // Check if the user email has the required domain for Admin role
  const isEligibleForAdmin =
    user.email && user.email.endsWith("@lotusbloomfamily.org");

  const additionalRoles = userRoles.filter(
    (role) => role === "Family Navigator" || role === "Admin",
  );

  const hasAdditionalRole = additionalRoles.length > 0;

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <h1 className={styles.title}>Edit Your Roles</h1>

        <div className={styles.userInfo}>
          <p>
            <strong>Current Email:</strong> {user.email}
          </p>
          <p>
            <strong>Current Roles:</strong>{" "}
            {loadingRoles
              ? "Loading..."
              : userRoles.length > 0
                ? userRoles.join(", ")
                : "No additional roles"}
          </p>

          {/* Display additional roles with remove buttons */}
          {additionalRoles.length > 0 && (
            <div className={styles.currentRoles}>
              <strong>Additional Roles:</strong>
              <div className={styles.rolesList}>
                {additionalRoles.map((role) => (
                  <div key={role} className={styles.roleItem}>
                    <span>{role}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(role)}
                      disabled={isSubmitting}
                      className={styles.removeButton}
                      aria-label={`Remove ${role} role`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {!hasAdditionalRole && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Select an additional role:</label>
              <select
                value={selectedRole}
                onChange={handleRoleChange}
                className={styles.select}
                disabled={isSubmitting}
              >
                <option value="">-- Select a role --</option>
                <option value="Family Navigator">Family Navigator</option>
                {isEligibleForAdmin && <option value="Admin">Admin</option>}
              </select>
              {!isEligibleForAdmin && (
                <p className={styles.note}>
                  Note: Admin role is only available for @lotusbloomfamily.org
                  email addresses
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !selectedRole}
              className={styles.button}
            >
              {isSubmitting ? "Processing..." : "Assign Role"}
            </button>
          </form>
        )}

        {hasAdditionalRole && !isSubmitting && (
          <p className={styles.info}>
            You already have an additional role. Remove your current role to
            assign a different one.
          </p>
        )}

        {status && (
          <div
            className={`${styles.status} ${
              status.includes("Error")
                ? styles.error
                : status.includes("Success")
                  ? styles.success
                  : styles.info
            }`}
          >
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
