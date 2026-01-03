/**
 * Form state example.
 *
 * Demonstrates:
 * - Managing form fields
 * - Form validation
 * - Reset functionality
 */

import { createStore } from '@oxog/state';

interface FormState {
  name: string;
  email: string;
  age: number;
  errors: Record<string, string>;
}

// Create a form store
const formStore = createStore<FormState>({
  name: '',
  email: '',
  age: 0,
  errors: {},
});

// Update field
function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
  const state = formStore.getState();
  formStore.setState({
    ...state,
    [field]: value,
    errors: { ...state.errors, [field]: '' }, // Clear error
  });
}

// Validate form
function validateForm(): boolean {
  const state = formStore.getState();
  const errors: Record<string, string> = {};

  if (!state.name) errors.name = 'Name is required';
  if (!state.email) errors.email = 'Email is required';
  if (state.age < 18) errors.age = 'Must be 18 or older';

  if (Object.keys(errors).length > 0) {
    formStore.setState({ ...state, errors });
    return false;
  }

  return true;
}

// Usage
setField('name', 'John Doe');
setField('email', 'john@example.com');
setField('age', 25);

console.log(validateForm()); // true

// Reset form
formStore.reset();
