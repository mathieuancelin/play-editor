var Snippets = {};

(function(exports) {

    exports.insertSnippet = function(key) {
        $.get('/public/aceeditor/snippets/' + key + '.txt', function(data) {
            PlayEditor.editor.insert(data);
        });
    };

})(Snippets);