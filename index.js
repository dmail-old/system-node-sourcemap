/* global System */

if (typeof System === 'undefined') {
    throw new Error('System is undefined, you must require es6-module-loader or Systemjs before this one');
}

function installModuleScriptNames() {
    var moduleScriptNames = new Map();

    // get real file name from sourceURL comment
    function readSourceUrl(source) {
        var lastMatch;
        var match;
        var sourceURLRegexp = /\/\/#\s*sourceURL=\s*(\S*)\s*/mg;
        while (match = sourceURLRegexp.exec(source)) { // eslint-disable-line
            lastMatch = match;
        }

        return lastMatch ? lastMatch[1] : null;
    }

    function getLoadOrSourceURL(source, loadURL) {
        var loadSourceURL = readSourceUrl(source);
        var loadOrSourceURL;
        // get filename from the source if //# sourceURL exists in it
        if (loadSourceURL) {
            loadOrSourceURL = loadSourceURL;
        } else {
            loadOrSourceURL = loadURL;
        }

        return loadOrSourceURL;
    }

    moduleScriptNames.store = function(source, loadURL) {
        var loadOrSourceURL;

        if (this.has(loadURL)) {
            loadOrSourceURL = this.get(loadURL);
        } else {
            loadOrSourceURL = getLoadOrSourceURL(source, loadURL);
            this.set(loadURL, loadOrSourceURL);
        }

        return loadOrSourceURL;
    };

    var translate = System.translate;
    System.translate = function(load) {
        return translate.call(this, load).then(function(source) {
            moduleScriptNames.store(source, load.name);
            return source;
        });
    };

    return moduleScriptNames;
}

function installSourceMapStore() {
    var moduleScriptNames = installModuleScriptNames();

    function readSourceMapURL(source) {
        // Keep executing the search to find the *last* sourceMappingURL to avoid
        // picking up sourceMappingURLs from comments, strings, etc.
        var lastMatch;
        var match;
        // eslint-disable-next-line
        var sourceMappingURLRegexp = /(?:\/\/[@#][ \t]+sourceMappingURL=([^\s'"]+?)[ \t]*$)|(?:\/\*[@#][ \t]+sourceMappingURL=([^\*]+?)[ \t]*(?:\*\/)[ \t]*$)/mg;
        while (match = sourceMappingURLRegexp.exec(source)) { // eslint-disable-line
            lastMatch = match;
        }

        return lastMatch ? lastMatch[1] : null;
    }

    // returns a {map, optional url} object, or null if there is no source map
    function fetchSourceMapData(source/* , rootURL */) {
        var sourceMapURL = readSourceMapURL(source);
        var sourceMapPromise;

        if (sourceMapURL) {
            var base64SourceMapRegexp = /^data:application\/json[^,]+base64,/;
            if (base64SourceMapRegexp.test(sourceMapURL)) {
                // Support source map URL as a data url
                var rawData = sourceMapURL.slice(sourceMapURL.indexOf(',') + 1);
                var sourceMap = JSON.parse(new Buffer(rawData, 'base64').toString());
                // engine.debug('read sourcemap from base64 for', rootURL);
                sourceMapPromise = Promise.resolve(sourceMap);
                sourceMapURL = null;
            } else {
                // Support source map URLs relative to the source URL
                // engine.debug('the sourcemap url is', sourceMapURL);
                // sourceMapURL = new global.URL(rootURL, sourceMapURL);

                // try {
                sourceMapPromise = Promise.resolve(require(sourceMapURL));
                // } catch (e) {
                //     sourceMapPromise = Promise.resolve();
                // }
            }
        } else {
            sourceMapPromise = Promise.resolve();
        }

        return sourceMapPromise.then(function(sourceMap) {
            if (sourceMap) {
                return {
                    url: sourceMapURL,
                    map: sourceMap
                };
            }
            return null;
        });
    }

    var sourceMaps = new Map();
    function detectSourceMap(source, rootURL) {
        var sourceURL = moduleScriptNames.store(source, rootURL);

        // now read sourceMap url and object from the source
        return fetchSourceMapData(source, sourceURL).then(function(sourceMapData) {
            // if we find a sourcemap, store it
            if (sourceMapData) {
                var sourceMap = sourceMapData.map;
                var sourceMapUrl = sourceMapData.url;

                // engine.debug('set sourcemap for', sourceURL, Boolean(sourceMap));
                sourceMaps.set(sourceURL, sourceMap);

                // if sourcemap has contents check for nested sourcemap in the content
                var sourcesContent = sourceMap.sourcesContent;
                if (sourcesContent) {
                    return Promise.all(sourceMap.sources.map(function(source, i) {
                        var content = sourcesContent[i];
                        if (content) {
                            // we cannot do engine.moduleSources.set(source, content)
                            // because we can have many transpilation level like
                            // moduleSource -> babelSource -> minifiedSource

                            var sourceMapLocation;
                            // nested sourcemap can be relative to their parent
                            if (sourceMapUrl) {
                                sourceMapLocation = sourceMapUrl;// new global.URL(source, sourceMapUrl);
                            } else {
                                sourceMapLocation = source; // new global.URL(source, System.baseURL);
                            }

                            return detectSourceMap(content, sourceMapLocation);
                        }
                        return undefined;
                    }));
                }
            } else if (sourceMaps.has(sourceURL) === false) {
                // if no sourcemap is found store a null object to know their is no sourcemap for this file
                // the check sourceMaps.has(sourceURL) === false exists to prevent a indetical source wo
                // sourcemap to set sourcemap to null when we already got one
                // it happen when sourceMap.sourcesContent exists but does not contains sourceMap
                sourceMaps.set(sourceURL, null);
            }
        });
    }

    var translate = System.translate;
    System.translate = function(load) {
        return translate.call(this, load).then(function(source) {
            var metadata = load.metadata;
            var format = metadata.format;
            if (format === 'json' || format === 'defined' || format === 'global' || metadata.loader) {
                return source;
            }

            return detectSourceMap(source, load.name).then(function() {
                return source;
            });
        });
    };

    return sourceMaps;
}

module.exports = function install() {
    var sourceMaps;

    return new Promise(function(resolve) {
        resolve(installSourceMapStore());
    }).then(function(value) {
        sourceMaps = value;
        // eslint-disable-next-line
        return System.import('file:///' + __dirname + '/node_modules/@dmail/node-stacktrace/index.js');
    }).then(function(module) {
        return module.default;
    }).then(function(StackTrace) {
        var SourceMapConsumer = require('source-map').SourceMapConsumer;

        var consumers = {};
        function getSourceMapConsumer(location) {
            var consumer;

            if (location in consumers) {
                consumer = consumers[location];
            } else {
                var sourceMap = sourceMaps.get(location);
                if (sourceMap) {
                    consumer = new SourceMapConsumer(sourceMap);
                }
                consumers[location] = consumer;
            }

            return consumer;
        }

        function mapSourcePosition(position) {
            var sourceLocation = position.source;
            var consumer = getSourceMapConsumer(sourceLocation);

            if (consumer) {
                var originalPosition = consumer.originalPositionFor(position);

                // Only return the original position if a matching line was found. If no
                // matching line is found then we return position instead, which will cause
                // the stack trace to print the path and line for the compiled file. It is
                // better to give a precise location in the compiled file than a vague
                // location in the original file.
                if (originalPosition.source !== null) {
                    return originalPosition;
                }
            }

            return position;
        }

        function transformCallSite(callSite, index, callSites) {
            var sourceLocation = callSite.getScriptNameOrSourceURL() || callSite.getFileName();

            if (sourceLocation) {
                var line = callSite.getLineNumber();
                var column = callSite.getColumnNumber() - 1;

                // Fix position in Node where some (internal) code is prepended.
                // See https://github.com/evanw/node-source-map-support/issues/36
                var fromModule = typeof process !== 'undefined' && callSites.length &&
                callSites[callSites.length - 1].getFileName() === 'module.js';
                if (fromModule && line === 1) {
                    column -= 63;
                }

                var position = mapSourcePosition({
                    source: sourceLocation,
                    line: line,
                    column: column
                });

                callSite.source = position.source;
                callSite.lineNumber = position.line;
                callSite.columnNumber = position.column + 1;
            }
        }

        StackTrace.ondemand(); // prevent auto stack trace creation
        StackTrace.setTransformer(transformCallSite);

        return StackTrace;
    }).then(function(StackTrace) {
        var importMethod = System.import;
        System.import = function() {
            return importMethod.apply(this, arguments).catch(function(e) {
                StackTrace.install(e);
                return Promise.reject(e);
            });
        };
    });
};
