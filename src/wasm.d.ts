declare module '../wasm/localdemo_backend.js' {
  export default function init(): Promise<void>;
  export function validate_email(email: string): boolean;
  export function hash_password(password: string): string;
  export function verify_password(password: string, hash: string): boolean;
  export function generate_id(): string;
  export function generate_token(): string;
  export function validate_user_data(email: string, name: string, password: string): string;
  export function process_data(input: string): string;
  export function sanitize_input(input: string): string;
}

