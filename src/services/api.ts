import { ApiResponse } from '../types';
import { handleMockApi } from './mockBackend';

const RAW_ENDPOINT = (import.meta.env.VITE_API_ENDPOINT as string) || '';

// Default Apps Script Web App URL provided by Google Sheet deployment
export const DEFAULT_API_ENDPOINT =
  RAW_ENDPOINT && RAW_ENDPOINT.startsWith('http')
    ? RAW_ENDPOINT
    : 'https://script.google.com/macros/s/AKfycbwOFYdJB_DWZFpKkFh7DxERzmkGNREZuBhyCptqTf7-c8vD0zLI1CGeA-fiSRQ-xo94/exec';

const ENDPOINT_STORAGE_KEY = 'gvtiw_api_endpoint_mode';

export function getActiveEndpoint(): string {
  try {
    const saved = localStorage.getItem(ENDPOINT_STORAGE_KEY);
    if (saved) return saved;
  } catch {
    // ignore
  }
  return '/api/gas';
}

export function setActiveEndpoint(endpoint: string) {
  try {
    localStorage.setItem(ENDPOINT_STORAGE_KEY, endpoint);
  } catch {
    // ignore
  }
}

let authErrorHandler: (() => void) | null = null;

export function registerAuthErrorHandler(handler: () => void) {
  authErrorHandler = handler;
}

export function unregisterAuthErrorHandler() {
  authErrorHandler = null;
}

/**
 * Executes an API request.
 * 
 * Flow:
 * 1. Primary: Sends request to `/api/gas` (Node/Express or Vercel serverless proxy).
 *    This completely bypasses browser CORS/OPTIONS and 302-redirect restrictions.
 * 2. Fallback: If proxy route is unreachable (e.g. pure static offline), falls back to direct call or mock backend.
 */
export async function callApi<T = any>(action: string, payload: Record<string, any> = {}): Promise<T> {
  const currentEndpoint = getActiveEndpoint();

  if (currentEndpoint === 'mock' || currentEndpoint === 'local') {
    return runMockWithAuth<T>(action, payload);
  }

  // 1. Try server-side proxy route first (/api/gas)
  try {
    const proxyRes = await fetch('/api/gas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, payload }),
    });

    if (proxyRes.ok) {
      const json: ApiResponse<T> = await proxyRes.json();
      if (json && typeof json.ok === 'boolean') {
        if (!json.ok) {
          handleAuthFailure(json.error || 'Request failed');
          throw new Error(json.error || 'Server error occurred');
        }
        return json.data as T;
      }
    }
  } catch (proxyErr: any) {
    // If it's a logical API error from the backend (e.g., "Invalid username or PIN"), re-throw it directly!
    if (proxyErr && proxyErr.message && !isNetworkError(proxyErr.message)) {
      throw proxyErr;
    }
    console.warn('[LMS API] Proxy route /api/gas failed, attempting direct endpoint or fallback...');
  }

  // 2. Direct call to Google Apps Script URL
  const directEndpoint =
    currentEndpoint && currentEndpoint !== '/api/gas' ? currentEndpoint : DEFAULT_API_ENDPOINT;

  try {
    const response = await fetch(directEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({ action, payload }),
    });

    const text = await response.text();
    let json: ApiResponse<T>;
    try {
      json = JSON.parse(text);
    } catch {
      console.warn('[LMS API] Direct Apps Script returned non-JSON. Falling back to built-in backend.');
      return runMockWithAuth<T>(action, payload);
    }

    if (json && typeof json.ok === 'boolean') {
      if (!json.ok) {
        handleAuthFailure(json.error || 'Request failed');
        throw new Error(json.error || 'Server error occurred');
      }
      return json.data as T;
    }
  } catch (err: any) {
    if (err && err.message && !isNetworkError(err.message)) {
      throw err;
    }
  }

  // 3. Fallback to mock backend
  return runMockWithAuth<T>(action, payload);
}

function handleAuthFailure(errorMsg: string) {
  const lowerErr = errorMsg.toLowerCase();
  if (
    lowerErr.includes('unauthorized') ||
    lowerErr.includes('invalid token') ||
    lowerErr.includes('session expired') ||
    lowerErr.includes('session not found')
  ) {
    if (authErrorHandler) {
      authErrorHandler();
    }
  }
}

function isNetworkError(msg: string): boolean {
  const m = msg.toLowerCase();
  return (
    m.includes('failed to fetch') ||
    m.includes('network error') ||
    m.includes('aborted') ||
    m.includes('load failed') ||
    m.includes('proxy route')
  );
}

async function runMockWithAuth<T>(action: string, payload: Record<string, any>): Promise<T> {
  try {
    const data = await handleMockApi(action, payload);
    return data as T;
  } catch (err: any) {
    handleAuthFailure(err.message || '');
    throw err;
  }
}
