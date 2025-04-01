# Test Retry Helper

A utility to help retry failed tests by commenting out passed tests. This tool is particularly useful when you have a large test suite and want to focus on fixing specific failing tests.

## Features

- Automatically comments out passed tests
- Creates temporary test files with only failing tests
- Supports multiple retry attempts
- Configurable Mocha settings
- TypeScript support
- Automatic test failure tracking
- Detailed test execution logging

## Installation

```bash
npm install test-retry-helper
```

## Usage

1. Set up the retry reporter in your test setup file (e.g., `test/setup.ts`):

```typescript
import { setupRetryReporter } from 'test-retry-helper';

// Set up the reporter with optional custom retry file path
setupRetryReporter('testes_retry.json');

// Your other test setup code...
```

2. The reporter will automatically:
   - Track failed tests in the `afterEach` hook
   - Create and update a JSON file (e.g., `testes_retry.json`) with the following structure:
   ```json
   [
     {
       "testFile": "path/to/your/test/file.test.ts",
       "failedTests": ["Test name 1", "Test name 2"]
     }
   ]
   ```
   - Log test execution details (start, completion, failures)

3. Use the retry functionality in your code:

```typescript
import { TestRetry } from 'test-retry-helper';

// Create a new instance with optional configuration
const retry = new TestRetry({
  retryFile: 'testes_retry.json', // default
  mochaConfig: {
    timeout: 60000, // default
    require: 'ts-node/register' // default
  },
  retries: 3 // default
});

// Run the retry process
try {
  await retry.retryTests();
  console.log('All tests passed!');
} catch (error) {
  console.error('Tests failed after all retries:', error);
}

// Get list of temporary files created
const tempFiles = retry.getTempFiles();
```

## Configuration

The `TestRetry` constructor accepts an optional configuration object with the following properties:

- `retryFile`: Path to the JSON file containing test information (default: 'testes_retry.json')
- `mochaConfig`: Mocha configuration options (default: { timeout: 60000, require: 'ts-node/register' })
- `retries`: Number of retry attempts (default: 3)

## Example Test File

```typescript
// example.test.ts
describe('Example Test Suite', () => {
  it('should pass', () => {
    expect(true).to.be.true;
  });

  it('should fail', () => {
    expect(false).to.be.true; // This will fail
  });

  describe('Nested Suite', () => {
    it('should also fail', () => {
      expect(1).to.equal(2); // This will fail
    });
  });
});
```

When this test runs:
1. The reporter will track the failed tests
2. Create a `testes_retry.json` file with the failed test information
3. When you run the retry process, it will create a temporary file with only the failing tests

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

## License

MIT 