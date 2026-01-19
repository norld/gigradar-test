/**
 * Health check types
 */

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version?: string;
  checks?: Record<string, boolean>;
}
