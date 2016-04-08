# Sourcemap Polyfill

Add source map support on error stack trace of SystemJS transpiled code.

## Example

#### Executing es6 code without this module

```javascript
require('systemjs');
System.import('./test/modules/error.js').catch(function(error){
      console.error(error.stack);
});
```

Write the following in the console

```

Error: test
    at execute (system-node-sourcemap/test/modules/error.js!transpiled:9:13)
    at ensureEvaluated (system-node-sourcemap/node_modules/systemjs/dist/system.src.js:2007:26)

```

## Executing es6 code with this module

```javascript
require('systemjs');
require('system-node-sourcemap')().then(function() {
	return System.import('./test/modules/error.js');
}).catch(console.error);
```

Write a more interesting error in the console

```

system-node-sourcemap/test/modules/error.js:3:7
throw new Error('test'); // This is the original code
      ^Error: test
        at execute (system-node-sourcemap/test.js:3:7)
        at ensureEvaluated (system-node-sourcemap/node_modules/systemjs/dist/system.src.js:2007:26)

```

## Dependencies

- [node-sourcemap](https://github.com/dmail/node-sourcemap)
