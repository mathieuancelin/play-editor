var CommonUtils = CommonUtils || {};

(function(exports) {

    exports.Map = function(obj) {
        this.length = 0;
        this.items = {};
        for (var p in obj) {
            if (obj.hasOwnProperty(p)) {
                this.items[p] = obj[p];
                this.length++;
            }
        };
        this.put = function(key, value) {
            var previous = undefined;
            if (this.containsKey(key)) {
                previous = this.items[key];
            } else {
                this.length++;
            }
            this.items[key] = value;
            return previous;
        };
        this.get = function(key) {
            return this.containsKey(key) ? this.items[key] : undefined;
        };
        this.containsKey = function(key) {
            return this.items.hasOwnProperty(key);
        };
        this.remove = function(key) {
            if (this.containsKey(key)) {
                previous = this.items[key];
                this.length--;
                delete this.items[key];
                return previous;
            } else {
                return undefined;
            }
        };
        this.keys = function() {
            var keys = [];
            for (var k in this.items) {
                if (this.containsKey(k)) {
                    keys.push(k);
                }
            }
            return keys;
        };
        this.values = function() {
            var values = [];
            for (var k in this.items) {
                if (this.containsKey(k)) {
                    values.push(this.items[k]);
                }
            }
            return values;
        };
        this.each = function(fn) {
            for (var k in this.items) {
                if (this.containsKey(k)) {
                    fn(k, this.items[k]);
                }
            }
        };
        this.clear = function() {
            this.items = {};
            this.length = 0;
        };
    };

})(CommonUtils);

var Modules = Modules || {};

(function(exports) {

    if (typeof exports == "undefined") {
        throw "The namespace doesn't exists.";
    }
    if (typeof CommonUtils == "undefined") {
        throw "The namespace CommonUtils doesn't exists.";
    }
    if (typeof Modules == "undefined") {
        throw "The namespace Modules doesn't exists.";
    }

    exports.modules = new CommonUtils.Map();

    exports.lookup = function(namespaceString) {
        /**
        var parts = namespaceString.split('.');
        var parent = window;
        var currentPart = '';
        for(var i = 0, length = parts.length; i < length; i++) {
            currentPart = parts[i];
            parent[currentPart] = parent[currentPart] || {};
            parent = parent[currentPart];
        }
        return parent;
        **/
        if (!exports.modules.containsKey(namespaceString)) {
            var newModule = {};
            var parts = namespaceString.split(':');
            if (parts.length > 1) {
                newModule.moduleName = parts[0];
            } else {
                newModule.moduleName = namespaceString;
            }
            if (parts.length > 1) {
                newModule.moduleVersion = parts[1];
            } else {
                newModule.moduleVersion = "undefined";
            }
            newModule.setupModule = function() {};
            newModule.moduleReady = function() {};
            newModule.messageReceived = function(msg) {};
            exports.modules.put(namespaceString, newModule);
        }
        return exports.modules.get(namespaceString);
    };

    exports.use = function(namespace, callback) {
       if (!exports.modules.containsKey(namespace)) {
           throw ("Module " + namespace + " doesn't exists.");
       }
       return callback(exports.lookup(namespace));
    };

    exports.uses = function(namespaces, callback) {
        var dependencies = [];
        namespaces.forEach(function(item, idx, array) {
            if (!exports.modules.containsKey(item)) {
                throw ("Module " + item + " doesn't exists.");
            }
            dependencies[idx] = exports.lookup(item);
        });
        return callback.apply(null, dependencies);
    };

    exports.define = function(namespace, callback) {
        if (exports.modules.containsKey(namespace)) {
            throw ("Module " + namespace + " already exists.");
        }
        var mod = exports.lookup(namespace);
        callback(mod);
        return mod;
    };

    exports.defineWithDependencies = function(namespace, deps, callback) {
        if (exports.modules.containsKey(namespace)) {
            throw ("Module " + namespace + " already exists.");
        }
        var dependencies = [];
        var mod = exports.lookup(namespace);
        dependencies[0] = mod;
        deps.forEach(function(item, idx, array) {
            if (!exports.modules.containsKey(item)) {
                throw ("Module " + item + " doesn't exists.");
            }
            dependencies[idx + 1] = exports.lookup(item);
        });
        callback.apply(null, dependencies);
        return mod;
    };

    exports.modulesReady = function() {
        exports.modules.each(function(idx, item) {
            item.moduleReady();
        });
    };

    exports.modulesSetup = function() {
        exports.modules.each(function(idx, item) {
            item.setupModule();
        });
    };

    exports.initModules = function() {
        exports.modulesSetup();
        exports.modulesReady();
    };

    exports.printModules = function() {
        console.log("\n=========================================\n");
        console.log("Available modules are : \n");
        exports.modules.each(function(idx, item) {
            console.log("Module => '%s' in version '%s'", item.moduleName, item.moduleVersion);
        });
        console.log("\n=========================================\n");
    };

    exports.broadcast = function(msg) {
        exports.modules.each(function(idx, item) {
            item.messageReceived(msg);
        });
    };

    exports.sendToModules = function(modules, msg) {
        modules.forEach(function(item, idx, array) {
            exports.modules.each(function(modIdx, mod) {
                if (mod.moduleName == item) {
                    mod.messageReceived(msg);
                }
            });
        });
    };

    exports.sendToModulesMatching = function(regex, msg) {
        exports.modules.each(function(modIdx, mod) {
            if (mod.moduleName.match(regex)) {
                mod.messageReceived(msg);
            }
        });
    };

    exports.sendToModule = function(moduleName, msg) {
         exports.lookup(moduleName).messageReceived(msg);
    };

})(Modules);

/**
 *
 * Usage of namespace lib :
 *
 * Modules.define('play.foo.bar', function(exports) {
 *     exports.hello = function(name) {
 *         console.log("hello %s!", name);
 *     };
 * });
 *
 * Modules.use('play.foo.bar', function(NS) {
 *     NS.hello('foobar');
 * });
 *
 * var Bar = Bar || Modules.lookup('play.foo.bar');
 * Bar.hello('foobar');
 *
 **/