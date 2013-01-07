/**
 * Library for modules management.
 *
 * Can handle :
 *  - module definition with optional dependency injection
 *  - module usage with optional dependency injection
 *  - module lookup
 *  - modules status
 *  - module callback for module setup
 *  - module callback for app startup
 *  - event bus for modules
 *  - module callback for event receive
 *
 *  @author Mathieu ANCELIN
 *
 * ****************************************************************
 *
 * Usage of Modules lib
 *
 * ****************************************************************
 *
 * var FooBar = Modules.define('play.foo.bar', function() {
 *     return {
 *          hello: function(name) { return ("Hello " + name + "!"); }
 *     };
 * });
 *
 * Modules.use('play.foo.bar', function(fb) {
 *     console.log(fb.hello('foobar'));
 * });
 *
 * console.log(FooBar.hello('foobar'));
 *
 * var Bar = Bar || Modules.get('play.foo.bar');
 * console.log(Bar.hello('foobar'));
 *
 * Modules.create('ModuleA', function(ModuleA) {
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
 * Modules.create('ModuleA:1.0', function(ModuleA) {
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
 * Modules.create('ModuleA:2.0', function(ModuleA) {
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
 * Modules.create('ModuleB', function(ModuleB) {
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
 * Modules.createWithDependencies('ModuleC', ['ModuleA', 'ModuleB'], function(ModuleC, ModuleA, ModuleB) {
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
 * Modules.createWithDependencies('ModuleD', ['ModuleC', 'get'], function(ModuleD, ModuleC, get) {
 *     ModuleD.hello = function() {
 *         ModuleC.hello();
 *         console.log("Hello from module D");
 *     };
 *     ModuleD.messageReceived = function(msg) {
 *         console.log("Received in ModuleD %s", msg);
 *         get('ModuleA').hello();
 *     };
 * });
 *
 * Modules.initModules();
 * Modules.printModules();
 * Modules.use('ModuleD', function(ModuleD) {
 *     ModuleD.hello();
 * });
 * Modules.uses(['ModuleA', 'ModuleB', 'ModuleC', 'ModuleD'], function(ModuleA, ModuleB, ModuleC, ModuleD) {
 *     ModuleA.hello();
 *     ModuleB.hello();
 *     ModuleC.hello();
 *     ModuleD.hello();
 * });
 *
 * Modules.broadcast("Hello Modules ...");
 *
 * Modules.sendToModule('ModuleA', 'Hello ModuleA ...');
 *
 * Modules.sendToModules(['ModuleA', 'ModuleB'], 'Hello ModuleA and ModuleB ...');
 *
 * Modules.sendToModulesMatching(/Module[A-B]/i, 'Hello Module matching AB...');
 * Modules.sendToModulesMatching(/Module[C-D]/i, 'Hello Module matching CD...');
 *
 * Modules.sendToModulesMatching(/Module[A-Z]:[0-9*]\.[0-9*]/i, 'Hello versioned Modules ...');
 * Modules.sendToModulesMatching(/Module[A-z]:1\.[0-9*]/i, 'Hello Modules in v 1.x ...');
 * Modules.sendToModulesMatching(/Module[A-Z]:2\.[0-9*]/i, 'Hello Modules in v 2.x ...');
 *
 **/

var CommonUtils = CommonUtils || {};

(function(exports) {

    if (typeof exports == "undefined") {
        throw "The passed namespace isn't defined.";
    }
    // check if CommonUtils is defined
    if (typeof CommonUtils == "undefined") {
        throw "The namespace 'CommonUtils' doesn't exists.";
    }

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
    var registeredModules = new CommonUtils.Map();

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
     * @return {Object} the created or existing module
     */
    var getOrCreateModule = function(namespaceString) {
        if (!registeredModules.containsKey(namespaceString)) {
            exports.define(namespaceString, function() { return {}; });
        }
        return registeredModules.get(namespaceString);
    };

    /**
     * Register the module with specified name if not exists
     *
     * @param name module identifier
     * @param mod actual module
     */
    var registerModuleIfNotExists = function(name, mod) {
        if (!registeredModules.containsKey(name)) {
            registeredModules.put(name, mod);
        }
    };

    /**
     * Create a module out of anything
     *
     * @param mod the module
     * @param name the module identifier
     * @return {*} the module
     */
    var createModuleFrom = function(mod, name) {
        if (!mod.hasOwnProperty('moduleIdentifier')) mod.moduleIdentifier = name;
        var parts = name.split(':');
        if (parts.length > 1) {
            if (!mod.hasOwnProperty('moduleName')) mod.moduleName = parts[0];
        } else {
            if (!mod.hasOwnProperty('moduleName')) mod.moduleName = name;
        }
        if (parts.length > 1) {
            if (!mod.hasOwnProperty('moduleVersion')) mod.moduleVersion = parts[1];
        } else {
            if (!mod.hasOwnProperty('moduleVersion')) mod.moduleVersion = 'default';
        }
        if (!mod.hasOwnProperty('setupModule')) mod.setupModule = function() {};
        if (!mod.hasOwnProperty('moduleReady')) mod.moduleReady = function() {};
        if (!mod.hasOwnProperty('messageReceived')) mod.messageReceived = function(msg) {};
        return mod;
    };

    /************************ public API **************************************************/

    /**
     * Get the identified module if exists
     *
     * @param name module identifier
     * @return {*} the module
     */
    exports.get = function(name) {
        if (!registeredModules.containsKey(name)) {
            throw ("Module '" + name + "' doesn't exists.");
        }
        return registeredModules.get(name);
    };

    /**
     * Get the required Module if exists and apply callback on it.
     *
     * @param namespace module identifier
     * @param callback function that will use the required module (passed as first argument)
     * @return {*} callback call result
     */
    exports.use = function(namespace, callback) {
       if (!registeredModules.containsKey(namespace)) {
           throw ("Module '" + namespace + "' doesn't exists.");
       }
       if (callback == undefined) {
           return getOrCreateModule(namespace);
       }
       return callback(getOrCreateModule(namespace));
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
            if (!registeredModules.containsKey(item)) {
                throw ("Module '" + item + "' doesn't exists.");
            }
            dependencies[idx] = getOrCreateModule(item);
        });
        return callback.apply(null, dependencies);
    };

    /**
     * Create a new Module if it doesn't exists
     *
     * @param namespace module identifier
     * @param callback function that will define module structure
     * @return {*} callback call result
     */
    exports.create = function(namespace, callback) {
        if (registeredModules.containsKey(namespace)) {
            throw ("Module '" + namespace + "' already exists.");
        }
        var mod = getOrCreateModule(namespace);
        callback(mod);
        return mod;
    };

    /**
     * Define a new Module if it doesn't exists
     *
     * @param namespace module identifier
     * @param callback function that will return the module
     * @return {*} callback call result
     */
    exports.define = function(namespace, callback) {
        if (registeredModules.containsKey(namespace)) {
            throw ("Module '" + namespace + "' already exists.");
        }
        var mod = createModuleFrom(callback(), namespace);
        registerModuleIfNotExists(namespace, mod);
        return mod;
    };

    /**
     * Create a new Module if it doesn't exists and requires dependencies on other modules.
     *
     * @param namespace module identifier
     * @param deps array of module identifiers
     * @param callback callback function that will define module structure
     * @return {*} callback call result
     */
    exports.createWithDependencies = function(namespace, deps, callback) {
        if (registeredModules.containsKey(namespace)) {
            throw ("Module '" + namespace + "' already exists.");
        }
        var dependencies = [];
        var mod = getOrCreateModule(namespace);
        dependencies[0] = mod;
        deps.forEach(function(item, idx, array) {
            if (!registeredModules.containsKey(item)) {
                throw ("Module '" + item + "' doesn't exists.");
            }
            dependencies[idx + 1] = getOrCreateModule(item);
        });
        callback.apply(null, dependencies);
        return mod;
    };

    /**
     * Define a new Module if it doesn't exists and requires dependencies on other modules.
     *
     * @param namespace module identifier
     * @param deps array of module identifiers
     * @param callback callback function that will return the module
     * @return {*} the module
     */
    exports.defineWithDependencies = function(namespace, deps, callback) {
        if (registeredModules.containsKey(namespace)) {
            throw ("Module '" + namespace + "' already exists.");
        }
        var dependencies = [];
        deps.forEach(function(item, idx, array) {
            if (!registeredModules.containsKey(item)) {
                throw ("Module '" + item + "' doesn't exists.");
            }
            dependencies[idx] = getOrCreateModule(item);
        });
        var mod = createModuleFrom(callback.apply(null, dependencies), namespace);
        registerModuleIfNotExists(namespace, mod);
        return mod;
    };

    /**
     * Function that can be called when the environment is ready to work.
     * Call 'setupModule()' on each existing module.
     */
    exports.modulesReady = function() {
        registeredModules.each(function(idx, item) {
            item.moduleReady();
        });
    };

    /**
     * Call 'moduleReady()' on each existing module.
     */
    exports.modulesSetup = function() {
        registeredModules.each(function(idx, item) {
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
        registeredModules.each(function(idx, item) {
            var type = "Module  ";
            if (typeof item === "function") {
                type = "Function";
            }
            status += (type + " => '" + item.moduleName + "' version '" + item.moduleVersion + "'\n");
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
        registeredModules.each(function(idx, item) {
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
            var module = registeredModules.get(item);
            if (module !== 'undefined') {
                module.messageReceived(msg);
            }
        });
    };

    /**
     * Call 'messageReceived(msg)' on modules with matching identifiers
     *
     * @param regex regular expression that matches module identifier
     * @param msg sent message
     */
    exports.sendToModulesMatching = function(regex, msg) {
        registeredModules.each(function(modIdx, mod) {
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
         getOrCreateModule(moduleIdentifier).messageReceived(msg);
    };

    /**
     * Remove an existing module from module system.
     *
     * @param moduleIdentifier the module identifier
     * @return {Object} the removed module
     */
    exports.remove = function(moduleIdentifier) {
        if (!registeredModules.containsKey(moduleIdentifier)) {
            throw ("Module '" + moduleIdentifier + "' doesn't exists.");
        }
        return registeredModules.remove(moduleIdentifier);
    };

    (function() {
        // register itself as modules
        exports.define('modules', function() { return exports; });
        exports.define('get', function() { return exports.get; });
        exports.define('broadcast', function() { return exports.broadcast; });
        exports.define('sendtomodules', function() { return exports.sendToModules; });
        exports.define('sendtomodulesmatching', function() { return exports.sendToModulesMatching; });
        exports.define('sendtomodule', function() { return exports.sendToModule; });
        // try to register jQuery as module if exists
        if (typeof jQuery != undefined) {
            exports.define('jquery', function() { return jQuery; });
        }
        // try to register underscorejs as module if exists
        if (typeof _ != undefined) {
            exports.define('underscore', function() { return _; });
        }
    })();

})(Modules);