/**
 * Real-world authentication state example.
 *
 * Demonstrates:
 * - Authentication flow
 * - Loading/error states
 * - Token management
 */

import { createStore, persist } from '@oxog/state';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Create auth store with persistence
const authStore = createStore<AuthState>({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}).use(
  persist({
    key: 'auth',
    whitelist: ['user', 'token', 'isAuthenticated'],
  })
);

// Actions
async function login(email: string, password: string) {
  authStore.setState({ loading: true, error: null });

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const { user, token } = await response.json();

    authStore.setState({
      user,
      token,
      isAuthenticated: true,
      loading: false,
    });
  } catch (error) {
    authStore.setState({
      error: (error as Error).message,
      loading: false,
    });
  }
}

function logout() {
  authStore.setState({
    user: null,
    token: null,
    isAuthenticated: false,
  });
}

// Usage
await login('user@example.com', 'password');

if (authStore.getState().isAuthenticated) {
  console.log('Logged in as:', authStore.getState().user?.name);
}

logout();

console.log('Is authenticated:', authStore.getState().isAuthenticated); // false
