import * as fs from 'fs';
import * as path from 'path';

export interface RetryTestEntry {
  testFile: string;
  failedTests: string[];
}

export class RetryReporter {
  private retryFile: string;
  private retryData: RetryTestEntry[] = [];

  constructor(retryFile: string = 'testes_retry.json') {
    this.retryFile = retryFile;
    this.loadExistingData();
  }

  private loadExistingData(): void {
    if (fs.existsSync(this.retryFile)) {
      try {
        this.retryData = JSON.parse(fs.readFileSync(this.retryFile, 'utf8'));
      } catch (error) {
        console.warn(`Failed to parse existing retry file: ${error}`);
        this.retryData = [];
      }
    }
  }

  public handleTestFailure(test: any): void {
    if (!test.file) {
      console.warn('Test file path not available');
      return;
    }

    const testFile = test.file;
    const testName = test.title;
    const testPath = test.titlePath();
    
    const existingFileEntry = this.retryData.find(entry => entry.testFile === testFile);
    
    if (existingFileEntry) {
      if (!existingFileEntry.failedTests.includes(testName)) {
        existingFileEntry.failedTests.push(testName);
        
        // Add all parent describes to retry
        if (testPath.length > 1) {
          for (let i = 0; i < testPath.length - 1; i++) {
            const currentPath = testPath[i];
            if (!existingFileEntry.failedTests.includes(currentPath)) {
              existingFileEntry.failedTests.push(currentPath);
            }
          }
        }
      }
    } else {
      const failedTests = [testName];
      
      // Add all parent describes to retry
      if (testPath.length > 1) {
        for (let i = 0; i < testPath.length - 1; i++) {
          failedTests.push(testPath[i]);
        }
      }

      this.retryData.push({
        testFile,
        failedTests
      });
    }

    this.saveRetryData();
  }

  private saveRetryData(): void {
    try {
      fs.writeFileSync(this.retryFile, JSON.stringify(this.retryData, null, 2));
    } catch (error) {
      console.error(`Failed to save retry data: ${error}`);
    }
  }

  public getRetryData(): RetryTestEntry[] {
    return this.retryData;
  }
} 