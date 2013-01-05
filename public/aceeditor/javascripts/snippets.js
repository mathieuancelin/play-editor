Modules.defineWithDependencies('play.plugin.editor.Snippets:1.0',
            ['play.plugin.editor.PlayEditor:1.0'], function(exports, PlayEditor) {

    exports.insertSnippet = function(key) {
        $.get('/public/aceeditor/snippets/' + key + '.txt', function(data) {
            PlayEditor.editor.insert(data);
        });
    };

});