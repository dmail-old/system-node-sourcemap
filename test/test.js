/* global System */

require('systemjs');
System.transpiler = 'babel';
require('../index.js');
require('../index.js'); // require twice just to check error is not logged twice

System.import('./test/modules/error.js').catch(function(error){
	console.log(String(error));
});