# Sourcemap Polyfill

Add source map support on error stack trace of SystemJS transpiled code.

## Example

We are going to execute the file at [test/modules/error.js](./test/modules/error.js) using this code 

```javascript
require('systemjs');
System.transpiler = 'babel';

System.import('./test/modules/error.js').catch(function(error){
	console.log(String(error));
});
```

Running the above outputs

```
Error: test
```

```javascript
require('systemjs');
System.transpiler = 'babel';
require('system-node-sourcemap');

System.import('./test/modules/error.js').catch(function(error){
	console.log(String(error));
});
```

Running the above now outputs : 

```
system-node-sourcemap/test.js:3
throw new Error('test'); // This is the original code
      ^Error: test
        at execute (system-node-sourcemap/test.js:3:7)
        at ensureEvaluated (system-node-sourcemap\node_modules\systemjs\dist\system.src.js:2108:26)
```

## Dependencies

- [node-sourcemap](https://github.com/dmail/node-sourcemap)
