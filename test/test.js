/* global System */

var path = require('path');

require('systemjs');
System.transpiler = 'babel';
System.paths.babel = 'file:///' + path.resolve(__dirname, '../node_modules/babel-core/browser.js');

require('../index.js')().then(function() {
    return System.import('./test/modules/error.js');
}).then(
    function(value) {
        console.log('import resolved with', value);
    },
    function(error) {
        console.log('import rejected with', error);
    }
);
