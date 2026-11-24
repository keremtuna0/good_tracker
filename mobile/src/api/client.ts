export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/** Token lives in this instance only; no plaintext password or token is persisted. */
export class ApiClient {
  private token: string | null = null;
  private baseUrl: string;
  onUnauthorized?: () => void;
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }
  setToken(token: string | null) {
    this.token = token;
  }
  async request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const sentToken = this.token;
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(sentToken ? { Authorization: `Bearer ${sentToken}` } : {}),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      if (response.status === 204) return undefined as T;
      const data = await response.json();
      if (!response.ok) {
        if (
          response.status === 401 &&
          path !== '/auth/login' &&
          this.token === sentToken
        )
          this.onUnauthorized?.();
        throw new ApiError(
          response.status,
          data.error?.code ?? 'REQUEST_FAILED',
          data.error?.message ?? 'Request failed.'
        );
      }
      return data as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        0,
        'NETWORK',
        'Could not reach the server. Check your connection and try again.'
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}
