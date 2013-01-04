var JavaCompiler = {};
(function(exports) {

    exports.compile = function(src) {
        return $.post('/@editor/compile', {src: src, path: $('#currentFileValue').html()}, function(data) {
            if (!data.compilation) {
                var line = data.errorLine - 1;
                PlayEditor.editor.getSession().setAnnotations([{text: data.msg, row: line, type:"error"}]);
                $('#message').attr('class', 'label label-important');
            } else {
                PlayEditor.editor.getSession().setAnnotations([]);
                $('#message').attr('class', 'label label-success');
            }
        });
    };

})(JavaCompiler);