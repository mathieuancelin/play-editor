var Snippets = Snippets || Modules.lookup('play.plugin.editor.Snippets:1.0');

(function(exports) {

    if (typeof exports == "undefined") {
        throw "The namespace doesn't exists.";
    }
    if (typeof Snippets == "undefined") {
        throw "The namespace 'Snippets' doesn't exists.";
    }

    exports.insertSnippet = function(key) {
        $.get('/public/aceeditor/snippets/' + key + '.txt', function(data) {
            PlayEditor.editor.insert(data);
        });
    };

})(Snippets);