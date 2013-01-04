var Namespace = Namespace || {};

(function(exports) {

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

})(Namespace);