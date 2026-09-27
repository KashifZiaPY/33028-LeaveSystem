import { ApiResponse } from '../types';

// The Google Apps Script Web App JSON API endpoint
export const DEFAULT_API_ENDPOINT = 'https://script.google.com/macros/s/AKfycbweYfgJwqilt0Fn-wtAJhzAsJK1DJU71-iLw2hX65QyqZuvV_o/exec';

let authErrorHandler: (() => void) | null = null;

export function registerAuthErrorHandler(handler: () => void) {
  authErrorHandler = handler;
}

export function unregisterAuthErrorHandler() {
  authErrorHandler = null;
}

/**
 * Execute an action against the Google Apps Script Web App endpoint.
 * Notice: We use POST with standard JSON body without custom headers
 * to prevent CORS preflight issues on Google Apps Script redirection.
 */
export async function callApi<T = any>(action: string, payload: Record<string, any> = {}): Promise<T> {
  const endpoint = DEFAULT_API_ENDPOINT;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      // Avoid custom headers (like Authorization or X-Custom) to bypass CORS preflight issues
      body: JSON.stringify({ action, payload }),
    });

    if (!response.ok && response.status !== 0) {
      // Non-200 HTTP status (though Apps Script usually responds with 200/302)
      throw new Error(`Server returned HTTP ${response.status}: ${response.statusText || 'Request failed'}`);
    }

    const text = await response.text();
    let json: ApiResponse<T>;

    try {
      json = JSON.parse(text);
    } catch {
      // If the response is not valid JSON
      throw new Error('Received invalid JSON response from server. Please check your internet connection or server status.');
    }

    if (!json || typeof json.ok !== 'boolean') {
      throw new Error('Malformed server response: expected { ok: boolean, data/error }');
    }

    if (!json.ok) {
      const errorMsg = json.error || 'An unexpected error occurred';
      
      // Check for auth / session invalidation
      const lowerErr = errorMsg.toLowerCase();
      if (
        lowerErr.includes('unauthorized') ||
        lowerErr.includes('invalid token') ||
        lowerErr.includes('session expired') ||
        lowerErr.includes('token expired') ||
        lowerErr.includes('session not found')
      ) {
        if (authErrorHandler) {
          authErrorHandler();
        }
      }

      throw new Error(errorMsg);
    }

    return json.data as T;
  } catch (err: any) {
    // If it is a browser CORS or network error
    if (err.name === 'TypeError' && err.message.toLowerCase().includes('failed to fetch')) {
      throw new Error('Network error: Unable to connect to the GVTIW server. Please check your internet connection.');
    }
    throw err;
  }
}
