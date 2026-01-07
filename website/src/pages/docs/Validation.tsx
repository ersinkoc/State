import { CodeBlock } from '@/components/code/CodeBlock';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const basicValidationCode = `import { createStore, validate } from '@oxog/state';

const store = createStore({
  email: '',
  password: '',
  age: 0,
})
.use(validate({
  validator: (state) => {
    const errors: Array<{ field: string; message: string }> = [];

    if (!state.email.includes('@')) {
      errors.push({ field: 'email', message: 'Invalid email address' });
    }

    if (state.password.length < 8) {
      errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
    }

    if (state.age < 0 || state.age > 150) {
      errors.push({ field: 'age', message: 'Age must be between 0 and 150' });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
}));`;

const zodValidationCode = `import { createStore, validate } from '@oxog/state';
import { z } from 'zod';

// Define schema with Zod
const userSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password too short'),
  age: z.number().min(0).max(150),
  profile: z.object({
    name: z.string().min(1, 'Name required'),
    bio: z.string().max(500, 'Bio too long').optional(),
  }),
});

const store = createStore({
  email: '',
  password: '',
  age: 0,
  profile: { name: '', bio: '' },
})
.use(validate({
  schema: userSchema,  // Pass Zod schema directly
  onError: (errors) => {
    console.error('Validation failed:', errors);
  },
}));`;

const timingValidationCode = `import { createStore, validate } from '@oxog/state';

const store = createStore({
  value: 0,
})
.use(validate({
  validator: (state) => ({
    valid: state.value >= 0,
    errors: state.value < 0 ? [{ field: 'value', message: 'Must be positive' }] : [],
  }),

  // When to run validation
  timing: 'before',  // 'before' | 'after' | 'both'

  // What to do on validation failure
  onError: (errors, state) => {
    console.error('Invalid state:', errors);
  },

  // Prevent invalid state changes (only works with timing: 'before')
  rejectInvalid: true,
}));

// This will be rejected and state won't change
store.setState({ value: -1 });
console.log(store.getState().value); // Still 0`;

const asyncValidationCode = `import { createStore, validate, createValidator } from '@oxog/state';

const store = createStore({
  username: '',
  isChecking: false,
  isAvailable: null as boolean | null,
})
.use(validate({
  validator: createValidator({
    // Sync validation runs immediately
    sync: (state) => {
      const errors = [];
      if (state.username.length < 3) {
        errors.push({ field: 'username', message: 'Too short' });
      }
      if (!/^[a-zA-Z0-9_]+$/.test(state.username)) {
        errors.push({ field: 'username', message: 'Invalid characters' });
      }
      return { valid: errors.length === 0, errors };
    },

    // Async validation runs after debounce
    async: async (state) => {
      const response = await fetch(\`/api/check-username?u=\${state.username}\`);
      const { available } = await response.json();

      if (!available) {
        return {
          valid: false,
          errors: [{ field: 'username', message: 'Username taken' }],
        };
      }
      return { valid: true, errors: [] };
    },

    asyncDebounce: 500,
  }),
}));`;

const reactValidationCode = `import { createStore, validate, useStore, useValidation } from '@oxog/state';

const formStore = createStore({
  email: '',
  password: '',
})
.use(validate({
  validator: (state) => {
    const errors = [];
    if (!state.email.includes('@')) {
      errors.push({ field: 'email', message: 'Invalid email' });
    }
    if (state.password.length < 8) {
      errors.push({ field: 'password', message: 'Password too short' });
    }
    return { valid: errors.length === 0, errors };
  },
}));

function LoginForm() {
  const { email, password } = useStore(formStore);
  const setState = useSetState(formStore);

  // Get validation state
  const { isValid, errors, getFieldError } = useValidation(formStore);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      // Submit form
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setState({ email: e.target.value })}
        />
        {getFieldError('email') && (
          <span className="error">{getFieldError('email')}</span>
        )}
      </div>

      <div>
        <input
          type="password"
          value={password}
          onChange={(e) => setState({ password: e.target.value })}
        />
        {getFieldError('password') && (
          <span className="error">{getFieldError('password')}</span>
        )}
      </div>

      <button type="submit" disabled={!isValid}>
        Login
      </button>
    </form>
  );
}`;

export function Validation() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl font-bold">Validation</h1>
          <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
            New in v1.2
          </span>
        </div>
        <p className="text-xl text-muted-foreground mb-8">
          Schema-agnostic state validation with Zod, Yup, or custom validators
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-4">Why Validation?</h2>
          <p className="text-muted-foreground mb-4">
            The validation plugin ensures your state always meets your requirements.
            It can prevent invalid state changes, provide error messages, and integrate
            with popular schema libraries like Zod and Yup.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Basic Validation</h2>
          <p className="text-muted-foreground mb-4">
            Create a custom validator function:
          </p>
          <CodeBlock code={basicValidationCode} language="typescript" filename="validation.ts" />

          <h2 className="text-2xl font-semibold mb-4">Zod Integration</h2>
          <p className="text-muted-foreground mb-4">
            Use Zod schemas directly for type-safe validation:
          </p>
          <CodeBlock code={zodValidationCode} language="typescript" filename="zod.ts" />

          <h2 className="text-2xl font-semibold mb-4">Validation Timing</h2>
          <p className="text-muted-foreground mb-4">
            Control when validation runs and whether to reject invalid updates:
          </p>
          <CodeBlock code={timingValidationCode} language="typescript" filename="timing.ts" />

          <h2 className="text-2xl font-semibold mb-4">Async Validation</h2>
          <p className="text-muted-foreground mb-4">
            Combine sync and async validation with debouncing:
          </p>
          <CodeBlock code={asyncValidationCode} language="typescript" filename="async.ts" />

          <h2 className="text-2xl font-semibold mb-4">React Integration</h2>
          <p className="text-muted-foreground mb-4">
            Use the <code>useValidation</code> hook to access validation state in components:
          </p>
          <CodeBlock code={reactValidationCode} language="typescript" filename="form.tsx" />

          <h2 className="text-2xl font-semibold mb-4">Supported Schema Libraries</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li><strong>Zod</strong>: Full support with automatic error extraction</li>
            <li><strong>Yup</strong>: Pass schema directly like Zod</li>
            <li><strong>Custom</strong>: Any function returning <code>{'{valid, errors}'}</code></li>
          </ul>
        </div>

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
          <Link
            to="/docs/effects"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Effects
          </Link>
          <Link
            to="/docs/testing"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            Testing
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
