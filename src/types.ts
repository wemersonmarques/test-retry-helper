export interface RetryTestEntry {
  testFile: string;
  failedTests: string[];
}

export interface RetryConfig {
  retryFile?: string;
  mochaConfig?: {
    timeout?: number;
    require?: string;
    spec?: string;
  };
  retries?: number;
} 