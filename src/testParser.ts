import * as ts from 'typescript';

export interface TestBlock {
  start: number;
  end: number;
  name: string;
}

/**
 * Parses TypeScript test files to find test blocks that need to be commented out.
 * Uses TypeScript's Abstract Syntax Tree (AST) to analyze the code structure.
 */
export function findTestBlocks(sourceFile: ts.SourceFile, failedTests: string[]): TestBlock[] {
  const testsToComment: TestBlock[] = [];

  function findTests(node: ts.Node) {
    if (
      node.kind === ts.SyntaxKind.CallExpression &&
      (node as ts.CallExpression).expression.kind === ts.SyntaxKind.Identifier &&
      ((node as ts.CallExpression).expression as ts.Identifier).text === 'it' ||
      ((node as ts.CallExpression).expression as ts.Identifier).text === 'test'
    ) {
      const callExpression = node as ts.CallExpression;
      
      if (callExpression.arguments.length > 0 && 
          callExpression.arguments[0].kind === ts.SyntaxKind.StringLiteral) {
        const testName = (callExpression.arguments[0] as ts.StringLiteral).text;
        
        if (!failedTests.includes(testName)) {
          if (callExpression.arguments.length > 1 && callExpression.arguments[1]) {
            const testBlock = callExpression.arguments[1];
            
            if (testBlock.kind === ts.SyntaxKind.ArrowFunction || 
                testBlock.kind === ts.SyntaxKind.FunctionExpression) {
              
              testsToComment.push({
                start: node.pos,
                end: node.end,
                name: testName
              });
            }
          }
        }
      }
    }

    ts.forEachChild(node, findTests);
  }

  ts.forEachChild(sourceFile, findTests);
  return testsToComment;
} 