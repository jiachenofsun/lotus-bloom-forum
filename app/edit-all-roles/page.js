"use client";

import { useState, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { listUsers } from "../actions/role-actions";
import styles from "./EditAllRoles.module.css";

export default function EditAllRoles() {
  const { user, isLoading } = useUser();
  const [status, setStatus] = useState("");
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

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
                  <th>Roles</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.user_id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        {user.roles && user.roles.length > 0
                          ? user.roles.join(", ")
                          : "No roles"}
                      </td>
                      <td>
                        <button
                          className={styles.editButton}
                          onClick={() => {
                            // We'll implement this later
                            console.log("Edit user:", user.user_id);
                          }}
                        >
                          Edit Roles
                        </button>
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
