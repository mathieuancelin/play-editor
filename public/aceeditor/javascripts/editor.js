var PlayEditor = PlayEditor || Modules.lookup('play.plugin.editor.PlayEditor:1.0');

(function(exports) {

    if (typeof exports == "undefined") {
        console.error("The namespace doesn't exists.");
        return;
    }
    if (typeof PlayEditor == "undefined") {
        console.error("The namespace PlayEditor doesn't exists.");
        return;
    }

    exports.editor = null;

    exports.configureEditor = function(line) {
        var editor = ace.edit("editor");
        editor.commands.addCommand({
            name: 'saveFile',
            bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
            exec: function(editor) {
                saveFile(editor);
            },
            readOnly: true
        });
        editor.commands.addCommand({
            name: 'launchFile',
            bindKey: {win: 'Ctrl-B',  mac: 'Command-B'},
            exec: function(editor) {
                launchFile(editor)
            },
            readOnly: true
        });
        editor.commands.addCommand({
            name: 'autocomplete',
            bindKey: {win: 'Ctrl-Space',  mac: 'Ctrl-Space'},
            exec: AutoComplete.ctrlSpaceTrigger,
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
            saveFile(editor);
        });
        editor.on("copy", function(text) {
            setContextualMessageFor2Sec('Copy selected text ...');
        });
        editor.getSession().on('change', function(e) {
            if (AutoComplete.displayAutoComplete) {
                AutoComplete.autoComplete();
            }
        });
        return editor;
    };

    exports.setup = function(line) {
        exports.editor = exports.configureEditor(line);
    };

})(PlayEditor);