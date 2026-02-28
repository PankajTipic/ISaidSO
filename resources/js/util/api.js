// import { host } from './constants';
// import { deleteUserData, getToken } from './session';

// export async function login(data) {
//   return await postOrPutData(host + '/api/login', data);
// }

// // Partner login function (renamed from login2 to be more descriptive)
// export async function login2(data) {
//   return await postOrPutData(host + '/api/partners/login', data);
// }

// // Alternative approach: Single login function with endpoint parameter
// export async function loginWithEndpoint(data, endpoint = '/api/login') {
//   return await postOrPutData(host + endpoint, data);
// }

// export async function register(data) {
//   return await postOrPutData(host + '/api/register', data);
// }

// // otp
// export async function sendOtp(data) {
//   return await postOrPutData(host + '/api/send-otp', data)
// }

// export async function verifyOtp(data) {
//   return await postOrPutData(host + '/api/verify-otp', data)
// }

// /**
//  * Posts form data to a URL and returns the response as JSON.
//  *
//  * @param {string} url - The URL to post to.
//  * @param {FormData} data - The form data to post.
//  * @returns {Promise<object>} A promise that resolves to the response data.
//  */
// export async function postFormData(url = '', data) {
//   try {
//     const token = getToken();
//     const response = await fetch(url, {
//       method: 'POST',
//       headers: {
//         Accept: 'application/json',
//         Authorization: `Bearer ${token}`,
//       },
//       body: data,
//     });

//     if (!response.ok) {
//       await handleError(response, url);
//     }

//     return response.json();
//   } catch (error) {
//     console.error('Error posting form data:', error);
//     throw error;
//   }
// }

// export async function postFormDataCsv(url = '', data) {
//   try {
//     const token = getToken();
//     const response = await fetch(url, {
//       method: 'POST',
//       headers: {
//         Accept: 'application/json',
//         Authorization: `Bearer ${token}`,
//         // No need to set Content-Type header for FormData
//       },
//       body: data, // 'data' is already a FormData object
//     });

//     if (!response.ok) {
//       await handleError(response, url);
//     }

//     return response.json();
//   } catch (error) {
//     console.error('Error posting form data:', error);
//     throw error;
//   }
// }

// /**
//  * Posts or puts data to a URL and returns the response as JSON.
//  *
//  * @param {string} url - The URL to post/put to.
//  * @param {object} data - The data to post/put.
//  * @param {string} method - HTTP method (POST or PUT).
//  * @returns {Promise<object>} A promise that resolves to the response data.
//  */
// async function postOrPutData(url = '', data = {}, method = 'POST') {
//   try {
//     const token = getToken();
//     const response = await fetch(url, {
//       method,
//       headers: {
//         'Content-Type': 'application/json',
//         Accept: 'application/json',
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify(data),
//     });

//     if (!response.ok) {
//       await handleError(response, url);
//     }

//     return response.json();
//   } catch (error) {
//     console.error(`Error with ${method} request to ${url}:`, error);
//     throw error;
//   }
// }

// /**
//  * Gets or deletes data from a URL and returns the response as JSON.
//  *
//  * @param {string} url - The URL to get/delete data from.
//  * @param {string} method - HTTP method (GET or DELETE).
//  * @returns {Promise<object>} A promise that resolves to the response data.
//  */
// async function getOrDelete(url = '', method = 'GET') {
//   try {
//     const token = getToken();
//     const response = await fetch(url, {
//       method,
//       headers: {
//         'Content-Type': 'application/json',
//         Accept: 'application/json',
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     if (!response.ok) {
//       await handleError(response, url);
//     }

//     return response.json();
//   } catch (error) {
//     console.error(`Error with ${method} request to ${url}:`, error);
//     throw error;
//   }
// }

// /**
//  * Handles errors in HTTP responses.
//  * IMPROVED: Now parses response body before throwing error
//  *
//  * @param {Response} response - The HTTP response object.
//  * @param {string} url - The URL for the request.
//  */
// async function handleError(response, url) {
//   // Handle 401 Unauthorized
//   if (response.status === 401 && !url.includes('/login')) {
//     deleteUserData();
//     window.location.replace('/');
//     return;
//   }

//   // Try to parse the response body to get detailed error message
//   let errorData = null;
//   try {
//     errorData = await response.json();
//   } catch (e) {
//     // If JSON parsing fails, throw generic error
//     throw new Error(`HTTP error! status: ${response.status}`);
//   }

//   // Create error object with response data attached
//   const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
//   error.response = {
//     status: response.status,
//     data: errorData
//   };

//   throw error;
// }

// // Exported utility functions
// export async function logout() {
//   return await postOrPutData(host + '/api/logout');
// }

// export async function logoutEverywhere() {
//   return await postOrPutData(host + '/api/logoutEverywhere');
// }

// export async function post(api, data) {
//   return await postOrPutData(host + api, data);
// }

// export async function put(api, data) {
//   return await postOrPutData(host + api, data, 'PUT');
// }

// export async function postAPICall(api, data) {
//   return await postOrPutData(host + api, data); // Alias for POST
// }

// export async function getAPICall(api) {
//   return await getOrDelete(host + api);
// }

// export async function deleteAPICall(api) {
//   return await getOrDelete(host + api, 'DELETE');
// }










// api.js  — Authentication & core API helpers
import { host } from './constants';
import { getAccessToken, getRefreshToken, setTokens, clearAuthData } from './session'; // ← better naming

// ────────────────────────────────────────────────
//  Public / No-auth-required endpoints
// ────────────────────────────────────────────────

export async function register(data) {
  return postPublic('/api/register', data);
}

export async function login(credentials) {
  return postPublic('/api/login', credentials);
}

// If you still have separate partner login
export async function loginPartner(credentials) {
  return postPublic('/api/partners/login', credentials);
}

export async function sendOtp(data) {
  return postPublic('/api/send-otp', data);
}

export async function verifyOtp(data) {
  return postPublic('/api/verify-otp', data);
}

export async function forgotPassword(email) {
  return postPublic('/api/auth/forgot-password', { email });
}

export async function resetPassword(data) {
  // data = { token, email, password, password_confirmation }
  return postPublic('/api/auth/reset-password', data);
}

// ────────────────────────────────────────────────
//  Authenticated calls (require valid access token)
// ────────────────────────────────────────────────

export async function logout() {
  try {
    await postAuth('/api/logout');
  } finally {
    clearAuthData();
  }
}

export async function getCurrentUser() {
  return getAuth('/api/user');
}

export async function updateProfile(data) {
  // data can contain FormData (for avatar) or plain object
  if (data instanceof FormData) {
    return postFormDataAuth('/api/update-profile', data); // we'll define below
  }
  return putAuth('/api/update-profile', data);
}

// ────────────────────────────────────────────────
//  Token Refresh (critical for 3-minute access tokens!)
// ────────────────────────────────────────────────

export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${host}/api/refresh`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${refreshToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw Object.assign(new Error(err.message || 'Refresh failed'), {
      status: response.status,
      data: err,
    });
  }

  const { access_token, refresh_token, expires_in, user } = await response.json();

  setTokens(access_token, refresh_token, expires_in);

  return { access_token, refresh_token, expires_in, user };
}

// ────────────────────────────────────────────────
//  Low-level helpers
// ────────────────────────────────────────────────

async function postPublic(endpoint, data) {
  const url = host + endpoint;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw Object.assign(new Error(errorData.message || 'Request failed'), {
      status: res.status,
      data: errorData,
    });
  }

  return res.json();
}

export async function getAuth(endpoint) {
  return requestAuth(endpoint, 'GET');
}

export async function postAuth(endpoint, data = {}) {
  return requestAuth(endpoint, 'POST', data);
}

export async function putAuth(endpoint, data = {}) {
  return requestAuth(endpoint, 'PUT', data);
}

export async function patchAuth(endpoint, data = {}) {
  return requestAuth(endpoint, 'PATCH', data);
}

export async function deleteAuth(endpoint) {
  return requestAuth(endpoint, 'DELETE');
}

export async function postFormDataAuth(endpoint, formData) {
  const token = getAccessToken();
  if (!token) throw new Error('Not authenticated');

  const url = host + endpoint;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
      // Important: Do NOT set Content-Type when using FormData
    },
    body: formData,
  });

  if (!res.ok) {
    if (res.status === 401) {
      // Try refresh once → then fail
      try {
        await refreshAccessToken();
        // Retry original request with new token
        return postFormDataAuth(endpoint, formData); // recursive retry (once)
      } catch {
        clearAuthData();
        window.location.replace('/login?session_expired=1');
        return;
      }
    }

    const errData = await res.json().catch(() => ({}));
    throw Object.assign(new Error(errData.message || 'Request failed'), {
      status: res.status,
      data: errData,
    });
  }

  return res.json();
}

export async function requestAuth(endpoint, method = 'GET', data = null) {
  let token = getAccessToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const url = host + endpoint;

  const headers = {
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  let body = null;
  if (data && method !== 'GET') {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(data);
  }

  const res = await fetch(url, { method, headers, body });

  if (res.status === 401) {
    // Try to refresh token once
    try {
      await refreshAccessToken();
      // Retry with new token (simple one-time retry)
      token = getAccessToken(); // updated
      headers['Authorization'] = `Bearer ${token}`;
      const retryRes = await fetch(url, { method, headers, body });
      if (!retryRes.ok) throw retryRes;
      return retryRes.json();
    } catch (refreshErr) {
      console.warn('Token refresh failed → logging out', refreshErr);
      clearAuthData();
      window.location.replace('/login?session_expired=1');
      throw refreshErr;
    }
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw Object.assign(new Error(errData.message || `HTTP ${res.status}`), {
      status: res.status,
      data: errData,
    });
  }

  return res.json();
}

// Optional: global fetch interceptor style (advanced)
export function initializeApiInterceptors() {
  // You can add more global behavior here later
  console.log('API helpers initialized');
}