import { User, UserRole } from '@/types/user';

/**
 * JWT payload interface matching the API response structure
 */
export interface JWTPayload {
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': string;
  exp: number;
  iss: string;
  aud: string;
  [key: string]: any;
}

/**
 * Decode JWT token and extract payload
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding if needed
    const paddedBase64 = base64 + '='.repeat((4 - base64.length % 4) % 4);
    
    const jsonPayload = decodeURIComponent(
      atob(paddedBase64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Check if JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

/**
 * Extract user ID from JWT token
 */
export function getUserIdFromToken(token: string): string | null {
  const payload = decodeJWT(token);
  return payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || null;
}

/**
 * Extract user email from JWT token
 */
export function getUserEmailFromToken(token: string): string | null {
  const payload = decodeJWT(token);
  return payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || null;
}

/**
 * Extract user role from JWT token
 */
export function getUserRoleFromToken(token: string): string | null {
  const payload = decodeJWT(token);
  return payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null;
}

/**
 * Parse user information from JWT token
 */
export function parseUserFromToken(token: string): Partial<User> | null {
  const payload = decodeJWT(token);
  if (!payload) return null;

  const userId = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
  const email = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
  const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

  if (!userId || !email || !role) return null;

  // Map API role to application role format
  let normalizedRole: UserRole;
  switch (role.toLowerCase()) {
    case 'superadmin':
      normalizedRole = 'super-admin';
      break;
    case 'companymanager':
      normalizedRole = 'company';
      break;
    case 'employee':
      normalizedRole = 'employee';
      break;
    default:
      normalizedRole = 'employee'; // Default fallback
  }

  return {
    id: userId,
    email: email,
    role: normalizedRole,
    name: email.split('@')[0], // Extract name from email as fallback
    isActive: true, // Default to active for logged-in users
    createdAt: new Date(), // Default date
    updatedAt: new Date(), // Default date
  };
} 