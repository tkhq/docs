import type { ErrorObject } from 'ajv';

export interface IOutputError {
  // Optional for required
  end?: { column: number; line: number; offset: number };
  error: string;
  start: { column: number; line: number; offset: number };
  suggestion?: string;
}

export interface IInputOptions {
  format?: 'cli-array' | 'cli' | 'js';
  indent?: number | null;

  /** Raw JSON used when highlighting error location */
  json?: string | null;
}

export default function <S, T, Options extends IInputOptions>(
  schema: S,
  data: T,
  errors: ErrorObject[],
  options?: Options,
): Options extends { format: 'js' }
  ? IOutputError[]
  : Options extends { format: 'cli-array' }
    ? { message: string }[]
    : string;
