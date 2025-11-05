/**
 * Authentication and Authorization Guard
 * 
 * This module provides role-based access control for the admin panel.
 * For now, it uses a mock user from environment variables.
 * In production, replace with JWT/session-based authentication.
 */

type UserRole = "SuperAdmin" | "CountyAdmin" | "Editor" | "Bidder";

interface User {
  id: number;
  email: string;
  role: UserRole;
  countyId?: number; // For CountyAdmin/Editor to restrict data access
}

/**
 * Get current user (mock implementation)
 * In production, extract from JWT token or session
 */
export function getCurrentUser(): User | null {
  // Mock user from environment variables (for development)
  const mockUserId = process.env.MOCK_USER_ID;
  const mockUserEmail = process.env.MOCK_USER_EMAIL || "admin@countyauction.com";
  const mockUserRole = (process.env.MOCK_USER_ROLE || "SuperAdmin") as UserRole;
  const mockUserCountyId = process.env.MOCK_USER_COUNTY_ID
    ? parseInt(process.env.MOCK_USER_COUNTY_ID)
    : undefined;

  if (!mockUserId) {
    console.warn("⚠️ No MOCK_USER_ID set in environment. Using default admin user.");
  }

  return {
    id: mockUserId ? parseInt(mockUserId) : 1,
    email: mockUserEmail,
    role: mockUserRole,
    countyId: mockUserCountyId,
  };
}

/**
 * Check if user has required role(s)
 */
export function requireRole(roleOrRoles: UserRole | UserRole[]): User {
  const user = getCurrentUser();
  
  if (!user) {
    throw new Error("Unauthorized: No user found");
  }

  const requiredRoles = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
  
  if (!requiredRoles.includes(user.role)) {
    throw new Error(
      `Forbidden: User role '${user.role}' does not have required permissions. Required: ${requiredRoles.join(", ")}`
    );
  }

  return user;
}

/**
 * Check if user has access to a specific county
 * SuperAdmin has access to all counties
 */
export function requireCountyAccess(countyId: number): User {
  const user = getCurrentUser();
  
  if (!user) {
    throw new Error("Unauthorized: No user found");
  }

  // SuperAdmin has access to all counties
  if (user.role === "SuperAdmin") {
    return user;
  }

  // CountyAdmin and Editor can only access their assigned county
  if (user.role === "CountyAdmin" || user.role === "Editor") {
    if (user.countyId !== countyId) {
      throw new Error(
        `Forbidden: User does not have access to county ${countyId}`
      );
    }
    return user;
  }

  // Bidders don't have county access in admin panel
  throw new Error("Forbidden: Bidders do not have admin panel access");
}

/**
 * Check if user can perform admin actions
 * Only SuperAdmin, CountyAdmin, and Editor can access admin panel
 */
export function requireAdminAccess(): User {
  const user = getCurrentUser();
  
  if (!user) {
    throw new Error("Unauthorized: No user found");
  }

  const adminRoles: UserRole[] = ["SuperAdmin", "CountyAdmin", "Editor"];
  
  if (!adminRoles.includes(user.role)) {
    throw new Error(
      `Forbidden: User role '${user.role}' does not have admin panel access`
    );
  }

  return user;
}

/**
 * API route wrapper for role-based protection
 * Usage: export const GET = withAuth(requireRole(["SuperAdmin", "CountyAdmin"]), async (req, user) => { ... })
 */
export function withAuth<T extends any[]>(
  authCheck: (user: User) => User,
  handler: (request: Request, user: User, ...args: T) => Promise<Response>
) {
  return async (request: Request, ...args: T): Promise<Response> => {
    try {
      const user = authCheck(getCurrentUser()!);
      return await handler(request, user, ...args);
    } catch (error: any) {
      console.error("Auth error:", error.message);
      return new Response(
        JSON.stringify({ error: error.message || "Unauthorized" }),
        {
          status: error.message?.includes("Forbidden") ? 403 : 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  };
}

