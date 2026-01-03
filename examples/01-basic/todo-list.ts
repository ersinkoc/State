/**
 * Todo list example.
 *
 * Demonstrates:
 * - Array state management
 * - Multiple state properties
 */

import { createStore } from '@oxog/state';

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

// Create a todo store
const todoStore = createStore({
  todos: [] as Todo[],
  filter: 'all' as 'all' | 'active' | 'completed',
});

// Add a todo
function addTodo(text: string) {
  const state = todoStore.getState();
  const newTodo: Todo = {
    id: Date.now(),
    text,
    done: false,
  };
  todoStore.setState({ todos: [...state.todos, newTodo] });
}

addTodo('Learn @oxog/state');
addTodo('Build something cool');

console.log(todoStore.getState());
// { todos: [{ id: ..., text: 'Learn @oxog/state', done: false }, ...], filter: 'all' }
