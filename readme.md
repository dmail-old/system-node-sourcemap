# Sourcemap Polyfill

Add source map support on error stack trace of SystemJS transpiled code.

## Without this module

```javascript
require('systemjs');
System.import('./test/modules/error.js').catch(function(error){
      console.log(error.stack);
});
```

Console output

```

Error: test
    at execute (system-node-sourcemap/test/modules/error.js!transpiled:9:13)
    at ensureEvaluated (system-node-sourcemap/node_modules/systemjs/dist/system.src.js:2007:26)
    
```

#### With this module

```javascript
require('systemjs');
require('system-node-sourcemap');

System.import('./test/modules/error.js').catch(console.error);
```

Console output

```

system-node-sourcemap/test/modules/error.js:3:7
throw new Error('test'); // This is the original code
      ^Error: test
        at execute (system-node-sourcemap/test.js:3:7)
        at ensureEvaluated (system-node-sourcemap/node_modules/systemjs/dist/system.src.js:2007:26)

```

## Dependencies

- [node-sourcemap](https://github.com/dmail/node-sourcemap)
