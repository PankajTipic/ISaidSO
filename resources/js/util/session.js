// const STORAGE_KEY = 'userData';

// /**
//  * Safely parse JSON data with error handling
//  */
// function safeJSONParse(jsonString) {
//   try {
//     return jsonString ? JSON.parse(jsonString) : null;
//   } catch (error) {
//     console.warn('Failed to parse stored user data:', error);
//     return null;
//   }
// }

// /**
//  * Check if localStorage is available and working
//  */
// function isLocalStorageAvailable() {
//   try {
//     const test = '__localStorage_test__';
//     localStorage.setItem(test, test);
//     localStorage.removeItem(test);
//     return true;
//   } catch (error) {
//     console.warn('localStorage is not available:', error);
//     return false;
//   }
// }

// /**
//  * Validate user data structure
//  */
// function isValidUserData(userData) {
//   return userData &&
//          typeof userData === 'object' &&
//          userData.token &&
//          (userData.user || userData.partner);
// }

// /**
//  * Stores user data in localStorage with validation
//  */
// export function storeUserData(userData) {
//   if (!isLocalStorageAvailable()) {
//     console.error('localStorage is not available');
//     return false;
//   }

//   if (!isValidUserData(userData)) {
//     console.error('Invalid user data provided');
//     return false;
//   }

//   try {
//     const dataWithTimestamp = {
//       ...userData,
//       _timestamp: Date.now()
//     };
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithTimestamp));
//     return true;
//   } catch (error) {
//     console.error('Failed to store user data:', error);
//     return false;
//   }
// }

// /**
//  * Retrieves raw user data from localStorage
//  */
// function getRawUserData() {
//   if (!isLocalStorageAvailable()) {
//     return null;
//   }

//   try {
//     const rawData = localStorage.getItem(STORAGE_KEY);
//     const userData = safeJSONParse(rawData);

//     if (!userData || typeof userData !== 'object') {
//       console.warn('Invalid or corrupted user data found');
//       deleteUserData();
//       return null;
//     }

//     return userData;
//   } catch (error) {
//     console.error('Error retrieving user data:', error);
//     return null;
//   }
// }

// /**
//  * Deletes user data from localStorage
//  */
// export function deleteUserData() {
//   if (!isLocalStorageAvailable()) {
//     return false;
//   }

//   try {
//     localStorage.removeItem(STORAGE_KEY);
//     return true;
//   } catch (error) {
//     console.error('Failed to delete user data:', error);
//     return false;
//   }
// }

// /**
//  * Returns whether the user is logged in
//  */
// export function isLoggedIn() {
//   const userData = getRawUserData();
//   return !!(userData && userData.token && (userData.user || userData.partner));
// }

// /**
//  * Legacy compatibility
//  */
// export function isLogIn() {
//   return isLoggedIn();
// }

// /**
//  * Returns the stored token or null
//  */
// export function getToken() {
//   const userData = getRawUserData();
//   return userData?.token ?? null;
// }

// /**
//  * Returns user type or null (works for both user and partner)
//  */
// export function getUserType() {
//   const userData = getRawUserData();
//   return userData?.user?.type ?? userData?.partner?.type ?? null;
// }

// /**
//  * Returns the user or partner object
//  */
// export function getUserData() {
//   const userData = getRawUserData();
//   return userData?.user ?? userData?.partner ?? null;
// }

// /**
//  * Returns the full data object including metadata
//  */
// export function getCompleteUserData() {
//   return getRawUserData();
// }

// /**
//  * Legacy compatibility
//  */
// export function getFullUserData() {
//   return getCompleteUserData();
// }

// /**
//  * Check if the stored data is expired
//  */
// export function isDataExpired(maxAge = 24 * 60 * 60 * 1000) {
//   const userData = getRawUserData();
//   if (!userData || !userData._timestamp) return true;
//   return (Date.now() - userData._timestamp) > maxAge;
// }

// /**
//  * Validate current session
//  */
// export function validateSession() {
//   const userData = getRawUserData();

//   if (!userData) return false;

//   if (isDataExpired()) {
//     console.warn('User session has expired');
//     deleteUserData();
//     return false;
//   }

//   if (!userData.token || (!userData.user && !userData.partner)) {
//     console.warn('Invalid session data');
//     deleteUserData();
//     return false;
//   }

//   return true;
// }

// /**
//  * Update specific fields in user data
//  */
// export function updateUserData(updates) {
//   const currentData = getRawUserData();

//   if (!currentData) {
//     console.error('No existing user data to update');
//     return false;
//   }

//   const updatedData = {
//     ...currentData,
//     ...updates,
//     _timestamp: Date.now()
//   };

//   return storeUserData(updatedData);
// }

// /**
//  * Clear all session data
//  */
// export function clearSession() {
//   deleteUserData();
//   console.log('Session cleared successfully');
// }

// /**
//  * Debug info
//  */
// export function debugSessionStorage() {
//   console.log('=== Session Storage Debug Info ===');
//   console.log('localStorage available:', isLocalStorageAvailable());
//   console.log('Raw stored data:', localStorage.getItem(STORAGE_KEY));
//   console.log('Parsed user data:', getRawUserData());
//   console.log('Is logged in:', isLoggedIn());
//   console.log('Token:', getToken());
//   console.log('User type:', getUserType());
//   console.log('User data:', getUserData());
//   console.log('Data expired:', isDataExpired());
//   console.log('Session valid:', validateSession());
// }




















// resources/util/session.js
// ────────────────────────────────────────────────
// Session / Auth Token Storage Utilities
// ────────────────────────────────────────────────

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRES_AT_KEY = 'token_expires_at';
const USER_DATA_KEY = 'user_data';

function isLocalStorageAvailable() {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function safeParse(json) {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch (err) {
    console.warn('Failed to parse stored JSON:', err);
    return null;
  }
}

const now = () => Date.now();

export function setTokens(accessToken, refreshToken, expiresInSeconds) {
  if (!isLocalStorageAvailable()) {
    console.error('localStorage not available');
    return false;
  }
  try {
    const expiresAt = now() + expiresInSeconds * 1000;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(TOKEN_EXPIRES_AT_KEY, expiresAt.toString());
    return true;
  } catch (err) {
    console.error('Failed to store tokens:', err);
    return false;
  }
}

export function getAccessToken() {
  if (!isLocalStorageAvailable()) return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  if (!isLocalStorageAvailable()) return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function isAccessTokenValid() {
  const token = getAccessToken();
  const expiresAtStr = localStorage.getItem(TOKEN_EXPIRES_AT_KEY);
  if (!token || !expiresAtStr) return false;
  const expiresAt = parseInt(expiresAtStr, 10);
  return !isNaN(expiresAt) && now() < expiresAt;
}

export function clearAuthData() {
  if (!isLocalStorageAvailable()) return;
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    sessionStorage.removeItem('dev_auth_verified');
    // Notify DevGuard in the same tab to re-lock
    window.dispatchEvent(new Event('dev-auth-cleared'));
    console.log('Auth data cleared');
  } catch (err) {
    console.error('Failed to clear auth data:', err);
  }
}

export function storeUserData(data) {
  if (!isLocalStorageAvailable()) return false;
  try {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify({
      ...data,
      _storedAt: now(),
    }));
    return true;
  } catch (err) {
    console.error('Failed to store user data:', err);
    return false;
  }
}

export function getUserData() {
  if (!isLocalStorageAvailable()) return null;
  const raw = localStorage.getItem(USER_DATA_KEY);
  return safeParse(raw);
}

export function isLoggedIn() {
  return !!getAccessToken() && isAccessTokenValid();
}

export function getTokenExpiresAt() {
  const expiresStr = localStorage.getItem(TOKEN_EXPIRES_AT_KEY);
  return expiresStr ? parseInt(expiresStr, 10) : null;
}

export function getSecondsUntilExpiry() {
  const expiresAt = getTokenExpiresAt();
  if (!expiresAt) return -1;
  return Math.max(0, Math.floor((expiresAt - now()) / 1000));
}

export function debugAuthStorage() {
  console.group('Auth Storage Debug');
  console.log('localStorage available:', isLocalStorageAvailable());
  console.log('Access Token:', getAccessToken()?.substring(0, 20) + '...');
  console.log('Refresh Token exists:', !!getRefreshToken());
  console.log('Token expires in:', getSecondsUntilExpiry(), 'seconds');
  console.log('Is logged in:', isLoggedIn());
  console.log('User data:', getUserData());
  console.groupEnd();
}