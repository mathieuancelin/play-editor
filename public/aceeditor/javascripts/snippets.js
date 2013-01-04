var Snippets = Snippets || Namespace.lookup('play.plugin.editor.Snippets');

(function(exports) {

    if (typeof exports == "undefined") {
        console.error("The namespace doesn't exists.");
        return;
    }
    if (typeof Snippets == "undefined") {
        console.error("The namespace Snippets doesn't exists.");
        return;
    }

    if (typeof exports == "undefined") {
        console.error("The namespace doesn't exists.");
        return;
    }

    exports.insertSnippet = function(key) {
        $.get('/public/aceeditor/snippets/' + key + '.txt', function(data) {
            PlayEditor.editor.insert(data);
        });
    };

})(Snippets);