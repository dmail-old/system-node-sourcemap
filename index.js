/* global System */

if( typeof System === 'undefined' ){
	throw new Error('System is undefined, you must require es6-module-loader or Systemjs before this one');
}

var sourceMap = require('node-sourcemap');

function readSource(path){
	path = path.replace('!transpiled', '');
	//path = System.normalize(path);

	if( false === path in System.sources ){
		//throw new Error('source undefined for ' + path);
	}
	else{
		return System.sources[path];
	}
}

if( !System.sources ){
	System.sources = {};

	function improveSyntaxError(error){
		if( error && error.name === 'SyntaxError' && error._babel ){
			// error.loc contains {line: 0, column: 0}
			var match = error.message.match(/([\s\S]+): Unterminated string constant \(([0-9]+)\:([0-9]+)/);

			if( match ){
				var improvedError = new SyntaxError();
				var column = match[3];
				column+= 62; // because node-sourcemap/index.js:155 will do column-=62

				improvedError.stack = 'SyntaxError: Unterminated string constant\n\t at ' + match[1] + ':' + match[2] + ':' + column;

				return improvedError;
			}
		}

		return error;
	}

	var translateMethod = System.translate;
	System.translate = function(load){
		return translateMethod.call(this, load).then(function(source){
			System.sources[load.address] = source;
			return source;
		}).catch(function(error){
			error = improveSyntaxError(error);
			return Promise.reject(error);
		});
	};

	System.trace = true;
	var importMethod = System.import;
	System.import = function(){
		return importMethod.apply(this, arguments).catch(function(error){
			error = sourceMap.transformError(error, readSource);
			return Promise.reject(error);
		});
	};

	// error are sourcemapped before being logged
	Object.defineProperty(Error.prototype, 'inspect', {
		enumerable: false,
		configurable: true,
		value: function(){
			return sourceMap.transformError(this, readSource).toString();
		}
	});

	process.on('uncaughtException', function handleUncaughtException(error){
		sourceMap.transformError(error, readSource);
		throw error;
	});
}

module.exports = function(error){
	return sourceMap.transformError(error, readSource);
};