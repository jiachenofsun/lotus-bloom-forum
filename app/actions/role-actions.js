"use server";

import { getSession } from "@auth0/nextjs-auth0";
import { ManagementClient } from "auth0";
import { cache } from "react";
import axios from "axios";

/* Gets a token from Auth0 for deleting roles */
const getManagementToken = async () => {
  const response = await axios.post(
    `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
    {
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
      grant_type: "client_credentials",
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  console.log(response.data);
  return response.data.access_token;
};

export async function setUserRole(userId, roleType) {
  try {
    const auth0 = new ManagementClient({
      domain: process.env.AUTH0_DOMAIN,
      clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
      clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
      scope: "read:users update:users delete:roles",
    });

    const currentRoles = await auth0.users.getRoles({ id: userId });
    const roleIds = currentRoles.data.map((role) => role.id);

    if (roleIds.length > 0) {
      const token = await getManagementToken();
      console.log("token", token);
      await axios.delete(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${userId}/roles`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          data: {
            roles: roleIds,
          },
        },
      );
    }

    if (roleType !== "None") {
      let roleId;
      if (roleType === "Family Navigator") {
        roleId = process.env.AUTH0_FAMILY_NAVIGATOR_ROLE_ID;
      } else if (roleType === "Admin") {
        roleId = process.env.AUTH0_ADMIN_ROLE_ID;
      }
      await auth0.users.assignRoles({ id: userId }, { roles: [roleId] });
    }

    return {
      success: true,
      message: `Successfully assigned ${roleType} role`,
    };
  } catch (error) {
    console.error("Error assigning role:", error);
    return {
      success: false,
      error: "Failed to assign role. Please try again later.",
    };
  }
}

export async function assignRole(user, roleType) {
  // Validate the role type
  if (!roleType || !["Family Navigator", "Admin"].includes(roleType)) {
    return {
      success: false,
      error: "Invalid role type",
    };
  }

  try {
    const auth0 = new ManagementClient({
      domain: process.env.AUTH0_DOMAIN,
      clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
      clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
    });

    let roleId;
    if (roleType === "Family Navigator") {
      roleId = process.env.AUTH0_FAMILY_NAVIGATOR_ROLE_ID;
    } else if (roleType === "Admin") {
      roleId = process.env.AUTH0_ADMIN_ROLE_ID;
    }

    if (!roleId) {
      return {
        success: false,
        error: "Role ID not configured",
      };
    }

    // Assign the role to the user
    await auth0.users.assignRoles({ id: user.sub }, { roles: [roleId] });

    return {
      success: true,
      message: `Successfully assigned ${roleType} role`,
    };
  } catch (error) {
    console.error("Error assigning role:", error);
    return {
      success: false,
      error: "Failed to assign role. Please try again later.",
    };
  }
}

export async function assignRoleSelf(roleType) {
  // Get the authenticated user session
  const session = await getSession();

  if (!session || !session.user) {
    return {
      success: false,
      error: "Not authenticated",
    };
  }

  const { user } = session;

  return assignRole(user, roleType);
}

export async function listUsers() {
  // Get the authenticated user session
  const session = await getSession();

  if (!session || !session.user) {
    return {
      success: false,
      error: "Not authenticated",
    };
  }

  try {
    const auth0 = new ManagementClient({
      domain: process.env.AUTH0_DOMAIN,
      clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
      clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
    });

    const userRoles = await getUserRoles(session.user);

    const isAdmin = userRoles.includes("Admin");

    // Verify the user is an Admin
    if (!isAdmin) {
      return {
        success: false,
        error: "Forbidden: Admin access required",
      };
    }

    // Get all users (with pagination)
    const users = await auth0.users.getAll({
      page: 0,
      per_page: 100,
    });

    // For each user, get their roles
    const usersWithRoles = await Promise.all(
      users.data.map(async (user) => {
        const roles = await getUserRoles(user);
        return {
          user_id: user.user_id,
          email: user.email,
          name: user.name,
          roles,
        };
      }),
    );

    return {
      success: true,
      users: usersWithRoles,
    };
  } catch (error) {
    console.error("Error listing users:", error);
    return {
      success: false,
      error: "Failed to retrieve users. Please try again later.",
    };
  }
}

/* User Name Management */

/**
 * Updates the name of the current authenticated user
 * @param {string} fullName - The new name to set for the user
 * @returns {Object} - Success or error response
 */
export async function updateUserName(fullName) {
  if (!fullName || fullName.trim() === "") {
    return {
      success: false,
      error: "Name cannot be empty",
    };
  }

  const session = await getSession();

  if (!session || !session.user) {
    return {
      success: false,
      error: "Not authenticated",
    };
  }

  const { user } = session;

  try {
    const auth0 = new ManagementClient({
      domain: process.env.AUTH0_DOMAIN,
      clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
      clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
    });

    await auth0.users.update({ id: user.sub }, { name: fullName });

    return {
      success: true,
      message:
        "Name updated successfully! Redirecting you to site-selection...",
    };
  } catch (error) {
    console.error("Error updating user name:", error);
    return {
      success: false,
      error: "Failed to update name. Please try again later.",
    };
  }
}

/**
 * Updates the name of any user (Admin only)
 * @param {string} userId - The ID of the user to update
 * @param {string} fullName - The new name to set for the user
 * @returns {Object} - Success or error response
 */
export async function updateUserNameAdmin(userId, fullName) {
  if (!userId || !fullName || fullName.trim() === "") {
    return {
      success: false,
      error: "User ID and name are required",
    };
  }

  const session = await getSession();

  if (!session || !session.user) {
    return {
      success: false,
      error: "Not authenticated",
    };
  }

  try {
    const auth0 = new ManagementClient({
      domain: process.env.AUTH0_DOMAIN,
      clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
      clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
    });

    const userRoles = await auth0.users.getRoles({
      id: session.user.sub,
    });

    const isAdmin = userRoles.data.some((role) => role.name === "Admin");

    if (!isAdmin) {
      return {
        success: false,
        error: "Forbidden: Admin access required",
      };
    }

    await auth0.users.update({ id: userId }, { name: fullName });

    return {
      success: true,
      message: "User name updated successfully",
    };
  } catch (error) {
    console.error("Error updating user name:", error);
    return {
      success: false,
      error: "Failed to update name. Please try again later.",
    };
  }
}

/**
 * Gets the most up-to-date user data directly from Auth0
 * @returns {Promise<{success: boolean, user?: any, error?: string}>}
 */
export async function getCurrentUser() {
  try {
    // Get session for the user ID
    const session = await getSession();

    // Check if session exists
    if (!session || !session.user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const userId = session.user.sub;

    // Initialize Auth0 Management client to get fresh user data
    const auth0 = new ManagementClient({
      domain: process.env.AUTH0_DOMAIN,
      clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
      clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
    });

    // Get the latest user data directly from Auth0
    const user = await auth0.users.get({ id: userId });

    return {
      success: true,
      user: user.data,
    };
  } catch (error) {
    console.error("Error fetching current user:", error);
    return {
      success: false,
      error: "Failed to fetch user data",
    };
  }
}

export const getUserName = cache(async (userId) => {
  try {
    const auth0 = new ManagementClient({
      domain: process.env.AUTH0_DOMAIN,
      clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
      clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
    });
    const user = await auth0.users.get({ id: userId });
    return user.data?.name || "Unknown User";
  } catch (error) {
    console.error("Error getting user name:", error);
    return "Unknown User";
  }
});

export const getUserRoles = cache(async (user) => {
  try {
    const auth0 = new ManagementClient({
      domain: process.env.AUTH0_DOMAIN,
      clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
      clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
    });
    const userRoles = await auth0.users.getRoles({
      id: user.sub || user.user_id,
    });
    return userRoles.data.map((roleObject) => roleObject.name);
  } catch (error) {
    console.error("Error getting roles:", error);
    return [];
  }
});

export const getUserDetails = cache(async (userId) => {
  const [name, roles] = await Promise.all([
    getUserName(userId),
    getUserRoles({ sub: userId }),
  ]);
  return { id: userId, name, roles };
});
