/**
 * Returns the base URL for API calls, using the NEXT_PUBLIC_APP_URL if set,
 * or falling back to an absolute path that will work in both client and server contexts.
 */
export function getBaseUrl() {
  // For server-side rendering (SSR) or when the environment variable is set
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // For client-side rendering without the environment variable
  // This works because relative URLs resolve against the current origin
  return '';
}
