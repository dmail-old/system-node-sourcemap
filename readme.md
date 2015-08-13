# Sourcemap Polyfill

This module provides source map on error stack trace of SystemJS transpiled code.

## Example

To run the example you need to install systemjs & babel-core : `npm i systemjs babel-core`.  
Now we can throw error of a transpiled file, you can check [main.js](./main.js) to see how the file is executed.

```javascript
"format es6";

throw new Error('test'); // This is the original code
```

Run without sourcemap : `node main`

```
Error: test
```

Run with sourcemap : `node main --sourcemap`

```
system-node-sourcemap/test.js:3
throw new Error('test'); // This is the original code
      ^Error: test
        at execute (system-node-sourcemap/test.js:3:7)
        at ensureEvaluated (system-node-sourcemap\node_modules\systemjs\dist\system.src.js:2108:26)
```

## Dependencies

- [node-sourcemap](https://github.com/dmail/node-sourcemap)
