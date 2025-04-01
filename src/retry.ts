import * as fs from 'fs';
import * as path from 'path';
import { RetryConfig, RetryTestEntry } from './types';
import { findTestBlocks } from './testParser';
import { createTempTestFile, readTestFile, parseTypeScriptFile, commentTestBlocks } from './fileUtils';

export class TestRetry {
  private config: RetryConfig;
  private retryFile: string;
  private tempFiles: string[] = [];

  constructor(config: RetryConfig = {}) {
    this.config = {
      retryFile: 'testes_retry.json',
      mochaConfig: {
        spec: '**/*_temp.test.ts',
        timeout: 60000,
        require: 'ts-node/register'
      },
      retries: 3,
      ...config
    };
    this.retryFile = this.config.retryFile!;
  }

  private async runMochaTests(): Promise<void> {
    const mochaConfig = this.config.mochaConfig!;
    const mochaConfigFile = 'mocha.config.json';
    
    fs.writeFileSync(mochaConfigFile, JSON.stringify(mochaConfig, null, 2));
    
    try {
      await new Promise<void>((resolve, reject) => {
        const mocha = require('mocha');
        const runner = new mocha.Runner();
        
        runner.on('end', () => {
          if (runner.failures > 0) {
            reject(new Error(`${runner.failures} tests failed`));
          } else {
            resolve();
          }
        });
        
        runner.run();
      });
    } finally {
      if (fs.existsSync(mochaConfigFile)) {
        fs.unlinkSync(mochaConfigFile);
      }
    }
  }

  private processTestFile(entry: RetryTestEntry): string {
    const content = readTestFile(entry.testFile);
    const sourceFile = parseTypeScriptFile(entry.testFile, content);
    const testBlocks = findTestBlocks(sourceFile, entry.failedTests);
    return commentTestBlocks(content, testBlocks);
  }

  public async retryTests(): Promise<void> {
    if (!fs.existsSync(this.retryFile)) {
      throw new Error(`Retry file not found: ${this.retryFile}`);
    }

    const retryData: RetryTestEntry[] = JSON.parse(fs.readFileSync(this.retryFile, 'utf8'));
    
    for (const entry of retryData) {
      if (!fs.existsSync(entry.testFile)) {
        console.warn(`Test file not found: ${entry.testFile}`);
        continue;
      }

      const modifiedContent = this.processTestFile(entry);
      const tempFile = createTempTestFile(entry.testFile, modifiedContent);
      this.tempFiles.push(tempFile);
    }

    let retryCount = 0;
    while (retryCount < this.config.retries!) {
      try {
        await this.runMochaTests();
        console.log('All tests passed!');
        break;
      } catch (error) {
        retryCount++;
        if (retryCount === this.config.retries) {
          throw new Error(`Failed after ${this.config.retries} retries`);
        }
        console.log(`Retry attempt ${retryCount} of ${this.config.retries}`);
      }
    }
  }

  public getTempFiles(): string[] {
    return this.tempFiles;
  }
} 