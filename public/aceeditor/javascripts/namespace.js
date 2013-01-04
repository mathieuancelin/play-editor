var Namespace = Namespace || {};

(function(exports) {

    if (typeof exports == "undefined") {
        console.error("The namespace doesn't exists.");
        return;
    }
    if (typeof Namespace == "undefined") {
        console.error("The namespace Namespace doesn't exists.");
        return;
    }

    exports.lookup = function(namespaceString) {
        var parts = namespaceString.split('.');
        var parent = window;
        var currentPart = '';
        for(var i = 0, length = parts.length; i < length; i++) {
            currentPart = parts[i];
            parent[currentPart] = parent[currentPart] || {};
            parent = parent[currentPart];
        }
        return parent;
    };

    exports.use = function(namespace, callback) {
       callback(exports.lookup(namespace));
    };

    exports.define = function(namespace, callback) {
        callback(exports.lookup(namespace));
    };

})(Namespace);

/**
 *
 * Usage of namespace lib :
 *
 * Namespace.define('play.foo.bar', function(exports) {
 *     exports.hello = function(name) {
 *         console.log("hello %s!", name);
 *     };
 * });
 *
 * Namespace.use('play.foo.bar', function(NS) {
 *     NS.hello('foobar');
 * });
 *
 * var NS = NS || Namespace.lookup('play.foo.bar');
 * NS.hello('foobar');
 *
 **/