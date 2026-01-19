/**
 * Logger types
 */

export interface LogEntry {
  timestamp: string;
  level: string;
  msg: string;
  requestId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  err?: Error;
  [key: string]: unknown;
}
