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
        }
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
        throw "The passed namespace isn't defined.";
    }
    // check if CommonUtils is defined to use Map()
    if (typeof CommonUtils == "undefined") {
        throw "The namespace 'CommonUtils' doesn't exists.";
    }
    // check if Modules is defined to be used by others
    if (typeof Modules == "undefined") {
        throw "The namespace 'Modules' doesn't exists.";
    }

    /**
     * Map of (identifier, module)
     *
     * @type {CommonUtils.Map}
     */
    exports.modules = new CommonUtils.Map();

    /**
     * Create a new module for identifier or get the existing one.
     * Add some functions and members to the module :
     * - moduleIdentifier
     * - moduleName extracted from moduleIdentifier
     * - moduleVersion extracted from moduleIdentifier
     * - setupModule()
     * - moduleReady()
     * - messageReceived(msg)
     *
     * @param namespaceString identifier of the module
     * @return {*} the created or existing module
     */
    exports.lookup = function(namespaceString) {
        if (!exports.modules.containsKey(namespaceString)) {
            var newModule = {};
            newModule.moduleIdentifier = namespaceString;
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

    /**
     * Get the required Module if exists and apply callback on it.
     *
     * @param namespace module identifier
     * @param callback function that will use the required module (passed as first argument)
     * @return {*} callback call result
     */
    exports.use = function(namespace, callback) {
       if (!exports.modules.containsKey(namespace)) {
           throw ("Module '" + namespace + "' doesn't exists.");
       }
       return callback(exports.lookup(namespace));
    };

    /**
     * Get the required modules if they exists and apply callback on them.
     *
     * @param namespaces array of module identifiers
     * @param callback function that will use the required modules (passed as arguments)
     * @return {*} callback call result
     */
    exports.uses = function(namespaces, callback) {
        var dependencies = [];
        namespaces.forEach(function(item, idx, array) {
            if (!exports.modules.containsKey(item)) {
                throw ("Module '" + item + "' doesn't exists.");
            }
            dependencies[idx] = exports.lookup(item);
        });
        return callback.apply(null, dependencies);
    };

    /**
     * Define a new Module if it doesn't exists
     *
     * @param namespace module identifier
     * @param callback function that will define module structure
     * @return {*} callback call result
     */
    exports.define = function(namespace, callback) {
        if (exports.modules.containsKey(namespace)) {
            throw ("Module '" + namespace + "' already exists.");
        }
        var mod = exports.lookup(namespace);
        callback(mod);
        return mod;
    };

    /**
     * Define a new Module if it doesn't exists and requires dependencies on other modules.
     *
     * @param namespace module identifier
     * @param deps array of module identifiers
     * @param callback callback function that will define module structure
     * @return {*} callback call result
     */
    exports.defineWithDependencies = function(namespace, deps, callback) {
        if (exports.modules.containsKey(namespace)) {
            throw ("Module '" + namespace + "' already exists.");
        }
        var dependencies = [];
        var mod = exports.lookup(namespace);
        dependencies[0] = mod;
        deps.forEach(function(item, idx, array) {
            if (!exports.modules.containsKey(item)) {
                throw ("Module '" + item + "' doesn't exists.");
            }
            dependencies[idx + 1] = exports.lookup(item);
        });
        callback.apply(null, dependencies);
        return mod;
    };

    /**
     * Function that can be called when the environment is ready to work.
     * Call 'setupModule()' on each existing module.
     */
    exports.modulesReady = function() {
        exports.modules.each(function(idx, item) {
            item.moduleReady();
        });
    };

    /**
     * Call 'moduleReady()' on each existing module.
     */
    exports.modulesSetup = function() {
        exports.modules.each(function(idx, item) {
            item.setupModule();
        });
    };

    /**
     * Init the module system. For instance in $(document).ready(Modules.initModules)
     */
    exports.initModules = function() {
        exports.modulesSetup();
        exports.modulesReady();
    };

    /**
     * Print the current status of module system
     */
    exports.printModules = function() {
        console.log(exports.status());
    };

    /**
     * Return the current status of module system
     */
    exports.status = function() {
        var status = "\n=========================================\n";
        status += "Available modules are : \n\n";
        exports.modules.each(function(idx, item) {
            status += ("Module => '" + item.moduleName + "' in version '" + item.moduleVersion + "'\n");
        });
        status += "=========================================\n";
        return status;
    };

    /**
     * Call 'messageReceived(msg)' on each registered module
     *
     * @param msg broadcasted message
     */
    exports.broadcast = function(msg) {
        exports.modules.each(function(idx, item) {
            item.messageReceived(msg);
        });
    };

    /**
     * Call 'messageReceived(msg)' on specified modules
     *
     * @param modules array of module identifiers
     * @param msg sent message
     */
    exports.sendToModules = function(modules, msg) {
        modules.forEach(function(item, idx, array) {
            exports.modules.each(function(modIdx, mod) {
                if (mod.moduleIdentifier == item) {
                    mod.messageReceived(msg);
                }
            });
        });
    };

    /**
     * Call 'messageReceived(msg)' on modules with matching identifiers
     *
     * @param regex regular expression that matches module identifier
     * @param msg sent message
     */
    exports.sendToModulesMatching = function(regex, msg) {
        exports.modules.each(function(modIdx, mod) {
            if (mod.moduleIdentifier.match(regex)) {
                mod.messageReceived(msg);
            }
        });
    };

    /**
     * Call 'messageReceived(msg)' on specified module
     *
     * @param moduleIdentifier identifier of the module
     * @param msg sent message
     */
    exports.sendToModule = function(moduleIdentifier, msg) {
         exports.lookup(moduleIdentifier).messageReceived(msg);
    };

    /**
     * Remove an existing module from module system.
     *
     * @param moduleIdentifier the module identifier
     * @return {*} the removed module
     */
    exports.remove = function(moduleIdentifier) {
        if (!exports.modules.containsKey(moduleIdentifier)) {
            throw ("Module '" + moduleIdentifier + "' doesn't exists.");
        }
        return exports.modules.remove(moduleIdentifier);
    };

})(Modules);

/**
 * Library for modules management. Can handle :
 *  - module definition with optional dependency injection
 *  - module usage with optional dependency injection
 *  - module lookup
 *  - modules status
 *  - module callback for module setup
 *  - module callback for app startup
 *  - event bus for modules
 *
 * Usage of Modules lib :
 *
 * var FooBar = Modules.define('play.foo.bar', function(exports) {
 *     exports.hello = function(name) {
 *         console.log("Hello %s!", name);
 *         return ("Hello " + name + "!");
 *     };
 * });
 *
 * var helloFooBar = Modules.use('play.foo.bar', function(NS) {
 *     NS.hello('foobar');
 * });
 *
 * FooBar.hello('foobar');
 *
 * var Bar = Bar || Modules.lookup('play.foo.bar');
 * Bar.hello('foobar');
 *
 * Modules.define('ModuleA', function(ModuleA) {
 *     ModuleA.hello = function() {
 *         console.log("Hello from module A");
 *     };
 *     ModuleA.setupModule = function() {
 *         console.log("Setup ModuleA");
 *     };
 *     ModuleA.messageReceived = function(msg) {
 *         console.log("Received in ModuleA %s", msg);
 *     };
 * });
 *
 * Modules.define('ModuleA:1.0', function(ModuleA) {
 *     ModuleA.hello = function() {
 *         console.log("Hello from module A v 1.0");
 *     };
 *     ModuleA.setupModule = function() {
 *         console.log("Setup ModuleA v 1.0");
 *     };
 *     ModuleA.messageReceived = function(msg) {
 *         console.log("Received in ModuleA v 1.0 %s", msg);
 *     };
 * });
 *
 * Modules.define('ModuleA:2.0', function(ModuleA) {
 *     ModuleA.hello = function() {
 *         console.log("Hello from module A v 2.0");
 *     };
 *     ModuleA.setupModule = function() {
 *         console.log("Setup ModuleA v 2.0");
 *     };
 *     ModuleA.messageReceived = function(msg) {
 *         console.log("Received in ModuleA v 2.0 %s", msg);
 *     };
 * });
 *
 * Modules.define('ModuleB', function(ModuleB) {
 *     ModuleB.hello = function() {
 *         console.log("Hello from module B");
 *     };
 *     ModuleB.moduleReady = function() {
 *         console.log("ModuleB is ready !!!");
 *     };
 *     ModuleB.messageReceived = function(msg) {
 *         console.log("Received in ModuleB %s", msg);
 *     };
 * });
 *
 * Modules.defineWithDependencies('ModuleC', ['ModuleA', 'ModuleB'], function(ModuleC, ModuleA, ModuleB) {
 *     ModuleC.hello = function() {
 *         ModuleA.hello();
 *         ModuleB.hello();
 *         console.log("Hello from module C");
 *     };
 *     ModuleC.messageReceived = function(msg) {
 *         console.log("Received in ModuleC %s", msg);
 *     };
 * });
 *
 * Modules.defineWithDependencies('ModuleD', ['ModuleC'], function(ModuleD, ModuleC) {
 *     ModuleD.hello = function() {
 *         ModuleC.hello();
 *         console.log("Hello from module D");
 *     };
 *     ModuleD.messageReceived = function(msg) {
 *          console.log("Received in ModuleD %s", msg);
 *     };
 * });
 *
 * Modules.initModules();
 * Modules.printModules();
 * Modules.use('ModuleD', function(ModuleD) {
 *     console.log('#####################################');
 *     ModuleD.hello();
 *     console.log('#####################################');
 * });
 * Modules.uses(['ModuleA', 'ModuleB', 'ModuleC', 'ModuleD'], function(ModuleA, ModuleB, ModuleC, ModuleD) {
 *
 *     ModuleA.hello();
 *     console.log('#####################################');
 *
 *     ModuleB.hello();
 *     console.log('#####################################');
 *
 *     ModuleC.hello();
 *     console.log('#####################################');
 *
 *     ModuleD.hello();
 *     console.log('#####################################');
 * });
 *
 * Modules.broadcast("Hello Modules ...");
 *
 * console.log('#####################################');
 * Modules.sendToModule('ModuleA', 'Hello ModuleA ...');
 *
 * console.log('#####################################');
 * Modules.sendToModules(['ModuleA', 'ModuleB'], 'Hello ModuleA and ModuleB ...');
 *
 * console.log('#####################################');
 * Modules.sendToModulesMatching(/Module[A-B]/i, 'Hello Module matching AB...');
 * Modules.sendToModulesMatching(/Module[C-D]/i, 'Hello Module matching CD...');
 *
 * console.log('#####################################');
 * Modules.sendToModulesMatching(/Module[A-Z]:[0-9*]\.[0-9*]/i, 'Hello versioned Modules ...');
 * Modules.sendToModulesMatching(/Module[A-z]:1\.[0-9*]/i, 'Hello Modules in v 1.x ...');
 * Modules.sendToModulesMatching(/Module[A-Z]:2\.[0-9*]/i, 'Hello Modules in v 2.x ...');
 *
 **/

// OLD CODE
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