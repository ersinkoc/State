import { CodeBlock } from '@/components/code/CodeBlock';
import { EXAMPLES } from '@/lib/constants';
import { FolderOpen } from 'lucide-react';

const counterCode = `import { createStore, useStore } from '@oxog/state';

const counterStore = createStore({
  count: 0,
  increment: (state) => ({ count: state.count + 1 }),
  decrement: (state) => ({ count: state.count - 1 }),
  reset: () => ({ count: 0 }),
});

function Counter() {
  const count = useStore(counterStore, (s) => s.count);
  const increment = useStore(counterStore, (s) => s.increment);
  const decrement = useStore(counterStore, (s) => s.decrement);
  const reset = useStore(counterStore, (s) => s.reset);

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}`;

const todoListCode = `import { createStore, useStore } from '@oxog/state';

type Todo = { id: number; text: string; done: boolean };

const todoStore = createStore({
  todos: [] as Todo[],
  addTodo: (state, text: string) => ({
    todos: [...state.todos, { id: Date.now(), text, done: false }],
  }),
  toggleTodo: (state, id: number) => ({
    todos: state.todos.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ),
  }),
  removeTodo: (state, id: number) => ({
    todos: state.todos.filter(todo => todo.id !== id),
  }),
});

function TodoList() {
  const todos = useStore(todoStore, (s) => s.todos);
  const addTodo = useStore(todoStore, (s) => s.addTodo);
  const toggleTodo = useStore(todoStore, (s) => s.toggleTodo);
  const removeTodo = useStore(todoStore, (s) => s.removeTodo);

  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      addTodo(input.trim());
      setInput('');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a todo..."
        />
        <button type="submit">Add</button>
      </form>

      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => toggleTodo(todo.id)}
            />
            <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <button onClick={() => removeTodo(todo.id)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}`;

export function Examples() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Examples</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Learn by example with common use cases
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          {EXAMPLES.map((section) => (
            <div key={section.category} className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <FolderOpen className="w-6 h-6 text-primary" />
                {section.category}
              </h2>
              <div className="space-y-6">
                {section.items.map((item) => (
                  <div
                    key={item.href}
                    id={item.href.split('#')[1]}
                    className="scroll-mt-20"
                  >
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    {item.title === 'Counter' && (
                      <CodeBlock code={counterCode} language="typescript" filename="Counter.tsx" />
                    )}
                    {item.title === 'Todo List' && (
                      <CodeBlock code={todoListCode} language="typescript" filename="TodoList.tsx" />
                    )}
                    {item.title !== 'Counter' && item.title !== 'Todo List' && (
                      <div className="p-4 border border-border rounded-lg bg-muted/50 text-muted-foreground">
                        Full example coming soon. Check the GitHub repository for more examples.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
