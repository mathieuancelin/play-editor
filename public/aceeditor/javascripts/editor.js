Modules.define('play.plugin.editor.PlayEditor:1.0', function(exports) {

    exports.editor = null;
    exports.main = null;
    exports.autoComplete = null;

    exports.configureEditor = function(line) {
        var editor = ace.edit("editor");
        editor.commands.addCommand({
            name: 'saveFile',
            bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
            exec: function(editor) {
                exports.main.saveFile(editor);
            },
            readOnly: true
        });
        editor.commands.addCommand({
            name: 'launchFile',
            bindKey: {win: 'Ctrl-B',  mac: 'Command-B'},
            exec: function(editor) {
                exports.main.launchFile(editor)
            },
            readOnly: true
        });
        editor.commands.addCommand({
            name: 'autocomplete',
            bindKey: {win: 'Ctrl-Space',  mac: 'Ctrl-Space'},
            exec: exports.autoComplete.ctrlSpaceTrigger,
            readOnly: true
        });
        editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode($('#typeOfFileValue').html());
        editor.setHighlightActiveLine(true);
        editor.getSession().setUseSoftTabs(true);
        editor.getSession().setTabSize(4);
        editor.setShowPrintMargin(false);
        editor.gotoLine(line);
        editor.on("blur", function() {
            exports.main.saveFile(editor);
        });
        editor.on("copy", function(text) {
            exports.main.setContextualMessageFor2Sec('Copy selected text ...');
        });
        editor.getSession().on('change', function(e) {
            if (exports.autoComplete.displayAutoComplete) {
                exports.autoComplete.autoComplete();
            }
        });
        return editor;
    };

    exports.setup = function(line) {
        exports.editor = exports.configureEditor(line);
    };

});