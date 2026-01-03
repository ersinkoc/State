/**
 * Async data fetching example.
 *
 * Demonstrates:
 * - Async actions
 * - Loading states
 * - Error handling
 */

import { createStore } from '@oxog/state';

interface User {
  id: number;
  name: string;
  email: string;
}

// Create store with async action
const userStore = createStore({
  user: null as User | null,
  loading: false,
  error: null as Error | null,
  $fetchUser: async (state: any, id: string) => {
    // Set loading state
    return { loading: true, error: null };
  },
});

// Proper async action with error handling
async function fetchUser(id: string) {
  userStore.setState({ loading: true, error: null });

  try {
    const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
    if (!response.ok) throw new Error('Failed to fetch');
    const user = await response.json();
    userStore.setState({ user, loading: false });
  } catch (error) {
    userStore.setState({
      error: error as Error,
      loading: false,
    });
  }
}

// Subscribe to state changes
userStore.subscribe((state) => {
  if (state.loading) {
    console.log('Loading user...');
  } else if (state.error) {
    console.log('Error:', state.error.message);
  } else if (state.user) {
    console.log('User loaded:', state.user.name);
  }
});

// Fetch user
await fetchUser('1');
// Output: Loading user...
// Output: User loaded: Leanne Graham
