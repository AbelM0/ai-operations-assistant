const DEFAULT_POST_AUTH_REDIRECT = "/workspace";

export function resolvePostAuthRedirect(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (
    candidate === DEFAULT_POST_AUTH_REDIRECT ||
    candidate?.startsWith(`${DEFAULT_POST_AUTH_REDIRECT}/`)
  ) {
    return candidate;
  }

  return DEFAULT_POST_AUTH_REDIRECT;
}
