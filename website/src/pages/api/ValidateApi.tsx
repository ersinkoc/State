import { CodeBlock } from '@/components/code/CodeBlock';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const signatureCode = `function validate(options: ValidateOptions): Plugin

interface ValidateOptions {
  validator?: (state: S) => ValidationResult;
  schema?: ZodSchema | YupSchema;
  timing?: 'before' | 'after' | 'both';
  onError?: (errors: ValidationError[], state: S) => void;
  rejectInvalid?: boolean;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  field: string;
  message: string;
}`;

const basicUsageCode = `import { createStore, validate } from '@oxog/state';

const store = createStore({
  email: '',
  password: '',
})
.use(validate({
  validator: (state) => {
    const errors: ValidationError[] = [];

    if (!state.email.includes('@')) {
      errors.push({ field: 'email', message: 'Invalid email' });
    }

    if (state.password.length < 8) {
      errors.push({ field: 'password', message: 'Min 8 characters' });
    }

    return { valid: errors.length === 0, errors };
  },
  onError: (errors) => console.error('Validation failed:', errors),
}));`;

const zodUsageCode = `import { createStore, validate } from '@oxog/state';
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password too short'),
  age: z.number().min(0, 'Age must be positive').max(150),
});

const store = createStore({
  email: '',
  password: '',
  age: 0,
})
.use(validate({
  schema: userSchema,
  timing: 'before',
  rejectInvalid: true,
}));`;

const timingCode = `import { validate } from '@oxog/state';

// Validate before state change (can reject)
store.use(validate({
  validator: (state) => ({ valid: state.count >= 0, errors: [] }),
  timing: 'before',
  rejectInvalid: true, // Prevents invalid state
}));

// Validate after state change (for logging/warnings)
store.use(validate({
  validator: (state) => ({ valid: state.count >= 0, errors: [] }),
  timing: 'after',
  onError: (errors) => console.warn('Invalid state:', errors),
}));

// Validate both before and after
store.use(validate({
  validator: (state) => ({ valid: true, errors: [] }),
  timing: 'both',
}));`;

const reactUsageCode = `import { useStore, useValidation } from '@oxog/state';

function Form() {
  const { email, password } = useStore(store);
  const setState = useSetState(store);

  // Access validation state
  const { isValid, errors, getFieldError } = useValidation(store);

  return (
    <form>
      <input
        value={email}
        onChange={(e) => setState({ email: e.target.value })}
      />
      {getFieldError('email') && (
        <span className="error">{getFieldError('email')}</span>
      )}

      <input
        type="password"
        value={password}
        onChange={(e) => setState({ password: e.target.value })}
      />
      {getFieldError('password') && (
        <span className="error">{getFieldError('password')}</span>
      )}

      <button disabled={!isValid}>Submit</button>
    </form>
  );
}`;

export function ValidateApi() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl font-bold font-mono">validate</h1>
          <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
            New in v1.2
          </span>
        </div>
        <p className="text-xl text-muted-foreground mb-8">
          Schema-agnostic validation plugin supporting Zod, Yup, or custom validators
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-4">Signature</h2>
          <CodeBlock code={signatureCode} language="typescript" />

          <h2 className="text-2xl font-semibold mb-4">Description</h2>
          <p className="text-muted-foreground mb-4">
            The <code>validate</code> plugin validates state changes against custom
            validators or schema libraries like Zod and Yup. It can prevent invalid
            state changes or simply report errors.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Options</h2>
          <table className="w-full text-left border-collapse mb-8">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-4">Option</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code>validator</code></td>
                <td className="py-2 pr-4"><code>function</code></td>
                <td className="py-2">Custom validation function</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code>schema</code></td>
                <td className="py-2 pr-4"><code>Schema</code></td>
                <td className="py-2">Zod or Yup schema</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code>timing</code></td>
                <td className="py-2 pr-4"><code>string</code></td>
                <td className="py-2">When to validate: 'before' | 'after' | 'both'</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code>onError</code></td>
                <td className="py-2 pr-4"><code>function</code></td>
                <td className="py-2">Callback when validation fails</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code>rejectInvalid</code></td>
                <td className="py-2 pr-4"><code>boolean</code></td>
                <td className="py-2">Prevent invalid state changes</td>
              </tr>
            </tbody>
          </table>

          <h2 className="text-2xl font-semibold mb-4">Custom Validator</h2>
          <CodeBlock code={basicUsageCode} language="typescript" filename="custom.ts" />

          <h2 className="text-2xl font-semibold mb-4">Zod Schema</h2>
          <p className="text-muted-foreground mb-4">
            Use Zod schemas directly for type-safe validation:
          </p>
          <CodeBlock code={zodUsageCode} language="typescript" filename="zod.ts" />

          <h2 className="text-2xl font-semibold mb-4">Validation Timing</h2>
          <p className="text-muted-foreground mb-4">
            Control when validation runs:
          </p>
          <CodeBlock code={timingCode} language="typescript" filename="timing.ts" />

          <h2 className="text-2xl font-semibold mb-4">React Integration</h2>
          <p className="text-muted-foreground mb-4">
            Use <code>useValidation</code> hook to access validation state:
          </p>
          <CodeBlock code={reactUsageCode} language="typescript" filename="Form.tsx" />

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Supported Schema Libraries</h4>
            <ul className="list-disc list-inside text-muted-foreground">
              <li><strong>Zod</strong> - Full support with automatic error extraction</li>
              <li><strong>Yup</strong> - Pass schema directly like Zod</li>
              <li><strong>Custom</strong> - Any function returning {'{valid, errors}'}</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
          <Link
            to="/api/effects"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            effects
          </Link>
          <div />
        </div>
      </div>
    </div>
  );
}
