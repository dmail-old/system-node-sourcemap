var sourceMap = require('node-sourcemap');
var readSource = function(path){
	if( path in System.sources ){
		return System.sources[path];
	}
};

var importMethod = System.import;
System.import = function(){
	return importMethod.apply(this, arguments).catch(function(error){
		return Promise.reject(sourceMap.transformError(error, readSource));
	});
};