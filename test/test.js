/* global System */

require('systemjs');
System.transpiler = 'babel';
require('../index.js').install();

var assert = require('assert');

System.import('./test/modules/error.js').then(
	function(value){
		console.log('import resolved with', value);
	},
	function(error){
		var stack = error.stack;
		assert.equal(error.lineNumber, 3);

		console.log('tests passed');
	}
);