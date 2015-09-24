# Sourcemap Polyfill

Add source map support on error stack trace of SystemJS transpiled code.

## Example

We are going to execute the file at [test/modules/error.js](./test/modules/error.js) using this code 

#### Javascript source

```javascript
require('systemjs');
System.import('./test/modules/error.js').catch(console.error);

```

#### Console output

```

[Error: test]

```

#### Javascript source

```javascript
require('systemjs');
require('system-node-sourcemap');

System.import('./test/modules/error.js').catch(console.error);
```

#### Console output

```

system-node-sourcemap/test/modules/error.js:3:7
throw new Error('test'); // This is the original code
      ^Error: test
        at execute (system-node-sourcemap/test.js:3:7)
        at ensureEvaluated (system-node-sourcemap\node_modules\systemjs\dist\system.src.js:2007:26)

```

## Dependencies

- [node-sourcemap](https://github.com/dmail/node-sourcemap)
