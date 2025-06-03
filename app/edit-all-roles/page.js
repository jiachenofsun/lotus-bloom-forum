"use client";

import { useState, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { listUsers, setUserRole } from "../actions/role-actions";
import styles from "./EditAllRoles.module.css";

export default function EditAllRoles() {
  const { user, isLoading } = useUser();
  const [status, setStatus] = useState("");
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [updatingUsers, setUpdatingUsers] = useState(new Set());

  useEffect(() => {
    async function fetchUsers() {
      if (user) {
        setIsLoadingUsers(true);
        try {
          const result = await listUsers();
          if (result.success) {
            setUsers(result.users);
          } else {
            setStatus(`Error: ${result.error}`);
          }
        } catch (error) {
          setStatus(`Error: ${error.message}`);
        } finally {
          setIsLoadingUsers(false);
        }
      }
    }

    fetchUsers();
  }, [user]);

  // Helper function to determine current role selection
  const getCurrentRoleSelection = (userRoles) => {
    if (!userRoles || userRoles.length === 0) return "None";

    // Check if user has Admin role
    if (userRoles.some((role) => role.includes("Admin"))) {
      return "Admin";
    }

    // Check if user has Family Navigator role
    if (userRoles.some((role) => role.includes("Family Navigator"))) {
      return "Family Navigator";
    }

    return "None";
  };

  // Handle role change
  const handleRoleChange = async (userId, newRole) => {
    setUpdatingUsers((prev) => new Set([...prev, userId]));
    setStatus("");

    try {
      const result = await setUserRole(userId, newRole);

      if (result.success) {
        setStatus(
          "Success: User roles updated successfully. Refreshing all roles...",
        );

        // Refresh the users list to show updated roles
        const refreshResult = await listUsers();
        if (refreshResult.success) {
          setUsers(refreshResult.users);
        }
      } else {
        setStatus(`Error: ${result.error}`);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setUpdatingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      setStatus("");
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <h1 className={styles.title}>Edit All User Roles</h1>

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

      <div className={styles.usersContainer}>
        <h2>All Users</h2>

        {isLoadingUsers ? (
          <p>Loading users...</p>
        ) : (
          <div className={styles.usersList}>
            <table className={styles.usersTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Current Roles</th>
                  <th>Assign Role</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((userItem) => (
                    <tr key={userItem.user_id}>
                      <td>{userItem.name}</td>
                      <td>{userItem.email}</td>
                      <td>
                        {userItem.roles && userItem.roles.length > 0
                          ? userItem.roles.join(", ")
                          : "No roles"}
                      </td>
                      <td>
                        <div className={styles.roleSelectContainer}>
                          <select
                            className={styles.roleSelect}
                            value={getCurrentRoleSelection(userItem.roles)}
                            onChange={(e) =>
                              handleRoleChange(userItem.user_id, e.target.value)
                            }
                            disabled={updatingUsers.has(userItem.user_id)}
                          >
                            <option value="None">None</option>
                            <option value="Family Navigator">
                              Family Navigator
                            </option>
                            <option value="Admin">Admin</option>
                          </select>
                          {updatingUsers.has(userItem.user_id) && (
                            <span className={styles.updating}>Updating...</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
