/* global System */

if (typeof System === 'undefined') {
    throw new Error('System is undefined, you must require es6-module-loader or Systemjs before this one');
}

var sourceMap = require('node-sourcemap');

function readSource(path) {
    path = path.replace('!transpiled', '');
    // path = System.normalize(path);

    if ((path in System.sources) === false) {
        // throw new Error('source undefined for ' + path);
    } else {
        return System.sources[path];
    }
}

if (!System.sources) {
    System.sources = {};

    var improveSyntaxError = function(error) {
        if (error && error.name === 'SyntaxError' && error._babel) {
            // error.loc contains {line: 0, column: 0}
            var match = error.message.match(/([\s\S]+): Unterminated string constant \(([0-9]+)\:([0-9]+)/);

            if (match) {
                var improvedError = new SyntaxError();
                var column = match[3];
                column += 63; // because node-sourcemap/index.js:155 will do column-=63

                var stack = '';

                stack += 'SyntaxError: Unterminated string constant\n\t at ';
                stack += match[1] + ':' + match[2] + ':' + column;

                improvedError.stack = stack;

                return improvedError;
            }
        }

        return error;
    };

    var translateMethod = System.translate;
    System.translate = function(load) {
        return translateMethod.call(this, load).then(function(source) {
            System.sources[load.address] = source;
            return source;
        }).catch(function(error) {
            error = improveSyntaxError(error);
            return Promise.reject(error);
        });
    };

    System.trace = true;

    // error are sourcemapped before being logged
    /*
    Object.defineProperty(Error.prototype, 'inspect', {
        enumerable: false,
        configurable: true,
        value: function(){
            return sourceMap.transformError(this, readSource).toString();
        }
    });
    */

    /*
    // not needed anymore thanks to Error.prepareStackTrace

    var importMethod = System.import;
    System.import = function(){
        return importMethod.apply(this, arguments).catch(function(error){
            error = sourceMap.transformError(error, readSource);
            return Promise.reject(error);
        });
    };

    process.on('uncaughtException', function handleUncaughtException(error){
        sourceMap.transformError(error, readSource);
        throw error;
    });
    */
}

module.exports = {
    StackTrace: sourceMap.StackTrace,

    install: function() {
        sourceMap.install(readSource);
    }
};
