import { RetryReporter } from './reporter';

let retryReporter: RetryReporter;

/**
 * Sets up Mocha hooks to automatically track failed tests and create retry files.
 * This should be called in your test setup file (e.g., test/setup.ts).
 * 
 * @example
 * ```typescript
 * // test/setup.ts
 * import { setupRetryReporter } from 'test-retry-helper';
 * 
 * // Set up the reporter with custom retry file path
 * setupRetryReporter('testes_retry.json');
 * 
 * // Your other test setup code...
 * ```
 * 
 * @param retryFile - Path to the JSON file that will store failed test information
 */
export function setupRetryReporter(retryFile: string = 'testes_retry.json'): void {
  retryReporter = new RetryReporter(retryFile);

  /**
   * Global beforeEach hook to log test start
   */
  beforeEach(function() {
    console.log(
      '\n-------------------------------------\n' +
      `Starting test: ${this.currentTest.title}` +
      '\n-------------------------------------\n'
    );
  });

  /**
   * Global afterEach hook to:
   * 1. Track failed tests
   * 2. Save retry information
   * 3. Log test completion
   */
  afterEach(function() {
    if (this.currentTest.state === 'failed') {
      // Track failed test for retry
      retryReporter.handleTestFailure(this.currentTest);
      
      console.log(
        '\n-------------------------------------\n' +
        `Test failed: ${this.currentTest.title}\n` +
        `Full path: ${this.currentTest.fullTitle()}\n` +
        `Test path: ${this.currentTest.titlePath()}` +
        '\n-------------------------------------\n'
      );
    } else {
      console.log(
        '\n-------------------------------------\n' +
        `Test passed: ${this.currentTest.title}` +
        '\n-------------------------------------\n'
      );
    }
  });
} 