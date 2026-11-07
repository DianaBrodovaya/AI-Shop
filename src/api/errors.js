export class ApiError extends Error {
  constructor(message, type, statusCode = null) {
    super(message);
    this.name = "ApiError";
    this.type = type;
    this.statusCode = statusCode;
  }
}

export const ErrorType = {
  NETWORK: "NETWORK",
  TIMEOUT: "TIMEOUT",
  RATE_LIMIT: "RATE_LIMIT",
  SERVER: "SERVER",
  CLIENT: "CLIENT",
  INVALID_RESPONSE: "INVALID_RESPONSE",
};

/**
 * Проверяет, стоит ли повторить запрос при данной ошибке.
 * Rate limit (429) обрабатывается отдельно через Retry-After.
 * @param {Error} error
 * @returns {boolean}
 */
export function isRetryable(error) {
  if (!(error instanceof ApiError)) return false;
  return [ErrorType.NETWORK, ErrorType.TIMEOUT, ErrorType.SERVER].includes(error.type);
}
