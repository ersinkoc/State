/**
 * Validation plugin for state schema validation.
 *
 * Provides schema-agnostic validation with support for Zod, Yup,
 * or custom validation functions.
 *
 * @module plugins/validate
 */

import type { Plugin, Store } from '../types.js';

/**
 * Validation error type.
 */
export interface ValidationError {
  /** Path to the invalid field */
  path: string[];
  /** Error message */
  message: string;
  /** Validation rule that failed */
  rule?: string;
  /** The invalid value */
  value?: unknown;
}

/**
 * Validation result.
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** List of validation errors */
  errors: ValidationError[];
}

/**
 * Custom validator function type.
 */
export type ValidatorFn<T> = (state: T) => boolean | ValidationResult | ValidationError[];

/**
 * Zod-like schema interface.
 */
export interface ZodLikeSchema<T> {
  safeParse(data: unknown): {
    success: boolean;
    error?: {
      issues: Array<{
        path: (string | number)[];
        message: string;
        code?: string;
      }>;
    };
    data?: T;
  };
}

/**
 * Yup-like schema interface.
 */
export interface YupLikeSchema<T> {
  validateSync(data: unknown, options?: { abortEarly?: boolean }): T;
  validate(data: unknown, options?: { abortEarly?: boolean }): Promise<T>;
}

/**
 * Schema type - supports Zod, Yup, or custom validators.
 */
export type Schema<T> = ZodLikeSchema<T> | YupLikeSchema<T> | ValidatorFn<T>;

/**
 * Validation timing options.
 */
export type ValidationTiming = 'change' | 'commit' | 'manual';

/**
 * Validation plugin options.
 */
export interface ValidateOptions<T> {
  /** Schema to validate against (Zod, Yup, or custom function) */
  schema: Schema<T>;
  /** When to validate: 'change' (every setState), 'commit' (on batch commit), 'manual' (only when validate() called) */
  on?: ValidationTiming;
  /** Callback when validation fails */
  onError?: (errors: ValidationError[]) => void;
  /** Throw error on validation failure */
  throwOnError?: boolean;
  /** Only validate these paths (keys of state) */
  paths?: Array<keyof T>;
  /** Name for debugging */
  name?: string;
}

/**
 * Validation API added to store.
 */
export interface ValidationAPI {
  /** Manually trigger validation */
  validate(): ValidationResult;
  /** Check if current state is valid */
  isValid(): boolean;
  /** Get current validation errors */
  getErrors(): ValidationError[];
  /** Clear validation errors */
  clearErrors(): void;
}

/**
 * Detect if schema is Zod-like.
 */
function isZodLike<T>(schema: Schema<T>): schema is ZodLikeSchema<T> {
  return (
    typeof schema === 'object' &&
    schema !== null &&
    'safeParse' in schema &&
    typeof schema.safeParse === 'function'
  );
}

/**
 * Detect if schema is Yup-like.
 */
function isYupLike<T>(schema: Schema<T>): schema is YupLikeSchema<T> {
  return (
    typeof schema === 'object' &&
    schema !== null &&
    'validateSync' in schema &&
    typeof schema.validateSync === 'function'
  );
}

/**
 * Extract partial state for path-based validation.
 */
function extractPaths<T>(state: T, paths: Array<keyof T>): Partial<T> {
  const result: Partial<T> = {};
  for (const path of paths) {
    if (path in (state as object)) {
      result[path] = (state as any)[path];
    }
  }
  return result;
}

/**
 * Validate state using the provided schema.
 */
function validateState<T>(
  state: T,
  schema: Schema<T>,
  paths?: Array<keyof T>
): ValidationResult {
  const stateToValidate = paths ? extractPaths(state, paths) : state;

  // Custom validator function
  if (typeof schema === 'function') {
    const result = schema(stateToValidate as T);

    // Boolean result
    if (typeof result === 'boolean') {
      return {
        valid: result,
        errors: result
          ? []
          : [{ path: [], message: 'Validation failed' }],
      };
    }

    // ValidationResult
    if ('valid' in result && 'errors' in result) {
      return result as ValidationResult;
    }

    // Array of errors
    if (Array.isArray(result)) {
      return {
        valid: result.length === 0,
        errors: result,
      };
    }

    return { valid: true, errors: [] };
  }

  // Zod-like schema
  if (isZodLike(schema)) {
    const result = schema.safeParse(stateToValidate);

    if (result.success) {
      return { valid: true, errors: [] };
    }

    const errors: ValidationError[] = (result.error?.issues || []).map((issue) => ({
      path: issue.path.map(String),
      message: issue.message,
      rule: issue.code,
    }));

    return { valid: false, errors };
  }

  // Yup-like schema
  if (isYupLike(schema)) {
    try {
      schema.validateSync(stateToValidate, { abortEarly: false });
      return { valid: true, errors: [] };
    } catch (error: any) {
      // Yup throws ValidationError with inner array
      const errors: ValidationError[] = [];

      if (error.inner && Array.isArray(error.inner)) {
        for (const err of error.inner) {
          errors.push({
            path: err.path ? err.path.split('.') : [],
            message: err.message,
            rule: err.type,
            value: err.value,
          });
        }
      } else {
        errors.push({
          path: error.path ? error.path.split('.') : [],
          message: error.message || 'Validation failed',
          rule: error.type,
        });
      }

      return { valid: false, errors };
    }
  }

  // Unknown schema type
  return { valid: true, errors: [] };
}

/**
 * Create a validation plugin.
 *
 * @param options - Validation options
 * @returns A validation plugin
 *
 * @example
 * ```typescript
 * import { createStore, validate } from '@oxog/state';
 * import { z } from 'zod';
 *
 * // With Zod schema
 * const userSchema = z.object({
 *   name: z.string().min(1),
 *   age: z.number().min(0),
 *   email: z.string().email(),
 * });
 *
 * const store = createStore({ name: '', age: 0, email: '' })
 *   .use(validate({
 *     schema: userSchema,
 *     on: 'change',
 *     onError: (errors) => console.log('Validation errors:', errors),
 *   }));
 *
 * // Manual validation
 * const result = store.validate();
 * if (!result.valid) {
 *   console.log(result.errors);
 * }
 *
 * // Check if valid
 * if (store.isValid()) {
 *   submitForm();
 * }
 * ```
 *
 * @example
 * ```typescript
 * // With custom validator function
 * const store = createStore({ password: '', confirmPassword: '' })
 *   .use(validate({
 *     schema: (state) => {
 *       const errors = [];
 *       if (state.password.length < 8) {
 *         errors.push({
 *           path: ['password'],
 *           message: 'Password must be at least 8 characters',
 *         });
 *       }
 *       if (state.password !== state.confirmPassword) {
 *         errors.push({
 *           path: ['confirmPassword'],
 *           message: 'Passwords must match',
 *         });
 *       }
 *       return errors;
 *     },
 *     on: 'change',
 *   }));
 * ```
 *
 * @example
 * ```typescript
 * // With partial validation
 * const store = createStore({ name: '', age: 0, temp: '' })
 *   .use(validate({
 *     schema: userSchema,
 *     paths: ['name', 'age'], // Only validate these fields
 *   }));
 * ```
 */
export function validate<TState>(
  options: ValidateOptions<TState>
): Plugin<TState> {
  const {
    schema,
    on = 'change',
    onError,
    throwOnError = false,
    paths,
    name = 'validate',
  } = options;

  return {
    name,
    version: '1.0.0',

    install(store: Store<TState>) {
      let currentErrors: ValidationError[] = [];

      // Validation function
      const doValidate = (): ValidationResult => {
        const state = store.getState();
        const result = validateState(state, schema, paths);

        currentErrors = result.errors;

        if (!result.valid) {
          if (onError) {
            onError(result.errors);
          }

          if (throwOnError) {
            const errorMessages = result.errors
              .map((e) => `${e.path.join('.')}: ${e.message}`)
              .join(', ');
            throw new Error(`Validation failed: ${errorMessages}`);
          }
        }

        return result;
      };

      // Subscribe if validation timing is 'change'
      if (on === 'change') {
        store.subscribe(() => {
          doValidate();
        });
      }

      // Add validation API to store
      const validationAPI: ValidationAPI = {
        validate: doValidate,
        isValid: () => currentErrors.length === 0,
        getErrors: () => [...currentErrors],
        clearErrors: () => {
          currentErrors = [];
        },
      };

      // Extend store with validation API
      Object.assign(store, validationAPI);
    },
  };
}

/**
 * Create a simple boolean validator.
 *
 * @param predicate - Validation predicate function
 * @param message - Error message when validation fails
 * @returns A validator function
 *
 * @example
 * ```typescript
 * const isPositive = createValidator(
 *   (state) => state.count >= 0,
 *   'Count must be positive'
 * );
 *
 * const store = createStore({ count: 0 })
 *   .use(validate({ schema: isPositive }));
 * ```
 */
export function createValidator<T>(
  predicate: (state: T) => boolean,
  message: string
): ValidatorFn<T> {
  return (state: T): ValidationResult => {
    const valid = predicate(state);
    return {
      valid,
      errors: valid ? [] : [{ path: [], message }],
    };
  };
}

/**
 * Combine multiple validators into one.
 *
 * @param validators - Array of validator functions
 * @returns Combined validator function
 *
 * @example
 * ```typescript
 * const combinedValidator = combineValidators(
 *   createValidator((s) => s.name.length > 0, 'Name required'),
 *   createValidator((s) => s.age >= 18, 'Must be 18+'),
 * );
 *
 * const store = createStore({ name: '', age: 0 })
 *   .use(validate({ schema: combinedValidator }));
 * ```
 */
export function combineValidators<T>(
  ...validators: ValidatorFn<T>[]
): ValidatorFn<T> {
  return (state: T): ValidationResult => {
    const allErrors: ValidationError[] = [];

    for (const validator of validators) {
      const result = validator(state);

      if (typeof result === 'boolean') {
        if (!result) {
          allErrors.push({ path: [], message: 'Validation failed' });
        }
      } else if ('valid' in result && 'errors' in result) {
        allErrors.push(...(result as ValidationResult).errors);
      } else if (Array.isArray(result)) {
        allErrors.push(...result);
      }
    }

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
    };
  };
}

/**
 * Create a field-level validator.
 *
 * @param field - Field name to validate
 * @param predicate - Validation predicate for field value
 * @param message - Error message when validation fails
 * @returns A validator function
 *
 * @example
 * ```typescript
 * const emailValidator = createFieldValidator(
 *   'email',
 *   (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
 *   'Invalid email format'
 * );
 *
 * const store = createStore({ email: '' })
 *   .use(validate({ schema: emailValidator }));
 * ```
 */
export function createFieldValidator<T, K extends keyof T>(
  field: K,
  predicate: (value: T[K], state: T) => boolean,
  message: string
): ValidatorFn<T> {
  return (state: T): ValidationResult => {
    const valid = predicate(state[field], state);
    return {
      valid,
      errors: valid ? [] : [{ path: [String(field)], message, value: state[field] }],
    };
  };
}

/**
 * Create an async validator (for server-side validation).
 *
 * @param validator - Async validation function
 * @returns A promise that resolves to validation result
 *
 * @example
 * ```typescript
 * const checkUsername = createAsyncValidator(async (state) => {
 *   const exists = await api.checkUsername(state.username);
 *   return exists
 *     ? [{ path: ['username'], message: 'Username already taken' }]
 *     : [];
 * });
 *
 * // Manual validation
 * const result = await checkUsername(store.getState());
 * ```
 */
export function createAsyncValidator<T>(
  validator: (state: T) => Promise<ValidationError[]>
): (state: T) => Promise<ValidationResult> {
  return async (state: T): Promise<ValidationResult> => {
    const errors = await validator(state);
    return {
      valid: errors.length === 0,
      errors,
    };
  };
}
