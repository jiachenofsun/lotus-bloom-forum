"use client";

import { useState, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { assignRoleSelf, getUserRoles } from "../actions/role-actions";
import styles from "./EditRoles.module.css";

/*
 * This page allows a user to edit their roles.
 * Currently, users can only add role.
 *
 * TODO:
 * - Display the current additional role a user has, if any (Family Navigator or Admin)
 *    - next to the role, add a 'x' icon that allows the user to remove the role.
 *    - you will need to make a server action to remove the role. (in actions/role-actions.js)
 * - Add logic to make sure the user can only have one additional role at a time.
 *    - if the user already has an additional role, do not display the select box.
 */

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
          e;
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
      // Call the server action
      const result = await assignRoleSelf(selectedRole);

      if (!result.success) {
        throw new Error(result.error || "Failed to assign role");
      }

      setStatus(
        `Success! The ${selectedRole} role has been assigned to your account.`,
      );
      setSelectedRole("");
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
  true;

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
        </div>

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
