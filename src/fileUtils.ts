import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { TestBlock } from './testParser';

export function createTempTestFile(originalFile: string, modifiedContent: string): string {
  const dir = path.dirname(originalFile);
  const filename = path.basename(originalFile, '.test.ts');
  const tempFile = path.join(dir, `${filename}_temp.test.ts`);
  
  // Remove existing temp file if it exists
  if (fs.existsSync(tempFile)) {
    fs.unlinkSync(tempFile);
  }
  
  fs.writeFileSync(tempFile, modifiedContent);
  return tempFile;
}

export function readTestFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

export function parseTypeScriptFile(filePath: string, content: string): ts.SourceFile {
  return ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );
}

export function commentTestBlocks(content: string, testBlocks: TestBlock[]): string {
  let modifiedContent = content;
  
  // Sort blocks from end to start to avoid position shifts
  testBlocks.sort((a, b) => b.start - a.start);
  
  for (const test of testBlocks) {
    const testText = content.slice(test.start, test.end);
    const commentedTest = testText
      .split('\n')
      .map(line => line ? '// ' + line : '//')
      .join('\n');
    
    modifiedContent = 
      modifiedContent.slice(0, test.start) + 
      commentedTest + 
      modifiedContent.slice(test.end);
  }
  
  return modifiedContent;
} 