import { RetryReporter } from './reporter';

let retryReporter: RetryReporter;

export function setupRetryReporter(retryFile: string = 'testes_retry.json'): void {
  retryReporter = new RetryReporter(retryFile);

  beforeEach(function() {
    // Optional: Add any setup logic here
  });

  afterEach(function() {
    if (this.currentTest.state === 'failed') {
      retryReporter.handleTestFailure(this.currentTest);
    }
  });
} 