const API_URL = 'http://localhost:3000/api/users';

// Register new user
async function registerUser(userData) {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    return await response.json();
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Network error during registration' };
  }
}

// Login user (token-based)
async function loginUser(credentials) {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();

    if (data.success && data.token) {
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Network error during login' };
  }
}

// Check if user is logged in (token-based)
function isLoggedIn() {
  return localStorage.getItem('user') !== null && localStorage.getItem('token') !== null;
}

// Get current user object
function getCurrentUser() {
  const userJson = localStorage.getItem('user');
  return userJson ? JSON.parse(userJson) : null;
}

// Logout user
function logoutUser() {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

// Get authenticated user's profile (token-based, example)
async function getUserProfile() {
  const token = localStorage.getItem('token');
  if (!token) return { success: false, message: 'Not authenticated' };

  try {
    const response = await fetch(`${API_URL}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return await response.json();
  } catch (error) {
    console.error('Profile fetch error:', error);
    return { success: false, message: 'Network error during profile fetch' };
  }
}

// Example: get current user's requests (token-based)
async function getMyRequests() {
  const token = localStorage.getItem('token');
  if (!token) return { success: false, message: 'Not authenticated' };

  try {
    const response = await fetch(`http://localhost:3000/api/requests/my`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return await response.json();
  } catch (error) {
    console.error('My requests fetch error:', error);
    return { success: false, message: 'Network error during fetch' };
  }
}