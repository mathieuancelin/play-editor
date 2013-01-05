var Range = ace.require('ace/range').Range

var AutoComplete = AutoComplete || Modules.lookup('play.plugin.editor.AutoComplete:1.0');

(function(exports) {

    if (typeof exports == "undefined") {
        throw "The namespace doesn't exists.";
    }
    if (typeof AutoComplete == "undefined") {
        throw "The namespace AutoComplete doesn't exists.";
    }

    exports.displayAutoComplete = false;
    exports.autoCompleteTokens = [];
    exports.autoCompleteStart = -1;
    exports.autoCompleteLine = -1;

    exports.checkIfValidToken = function(type, value) {
        return (type != "keyword.operator" && type != "text" && type != "lparen" && type != "rparen" && value != "<" && value != ">" && value != "*");
    };

    exports.endAutoComplete = function() {
        exports.displayAutoComplete = false;
        exports.autoCompleteTokens = [];
        exports.autoCompleteStart = -1;
        exports.autoCompleteLine = -1;
        $('#autocomplete').html('');
        $('#autocomplete').hide();
        PlayEditor.editor.focus();
    };

    exports.autoComplete = function() {
        var currentPos = PlayEditor.editor.selection.getCursor().column;
        var currentLine = PlayEditor.editor.selection.getCursor().row;
        if (currentLine != exports.autoCompleteLine) {
            exports.endAutoComplete();
        } else if (currentPos < exports.autoCompleteStart) {
            exports.endAutoComplete();
        } else {
            var line = PlayEditor.editor.getSession().getLine(currentLine);
            var typed = line.substring(exports.autoCompleteStart, currentPos + 1);
            var type = PlayEditor.editor.getSession().getTokenAt(currentLine, currentPos).type
            var value = PlayEditor.editor.getSession().getTokenAt(currentLine, currentPos).value
            if (exports.checkIfValidToken(type, value)) {
                try {
                    var tok = PlayEditor.editor.getSession().getTokenAt(currentLine, currentPos);
                    if (tok.value != undefined) {
                        typed = $.trim(tok.value);
                    } else {
                        typed = '';
                    }
                } catch (_) {
                    typed = '';
                }
            } else {
                typed = '';
            }
            //console.log("Completion based on token : '" + typed + "'");
            if (typed.endsWith(" ")) {
                exports.endAutoComplete();
            } else {
                var potentialTokens = jQuery.grep(exports.autoCompleteTokens, function(token, i){
                    return token.toLowerCase().startsWith(typed.toLowerCase());
                });
                var idx = potentialTokens.indexOf(typed);
                if (idx > -1) {
                    potentialTokens.splice(idx, 1);
                }
                var list = '<select multiple="multiple" size="10">';
                for (var t = 0; t < potentialTokens.length; t++) {
                    list += '<option>' + potentialTokens[t] + '</option>';
                }
                list += '</select>';
                $('#autocomplete').html('');
                $('#autocomplete').html(list);
                $('#autocomplete').show();
                $('#autocomplete option').first().attr('selected', 'selected');
            }
        }
    };

    exports.insertAutoComplete = function() {
        if (!$('#autocomplete select').is(':empty')) {
            var value = $('#autocomplete option[selected=selected]').first().val();
            var currentPos = PlayEditor.editor.selection.getCursor().column;
            var currentLine = PlayEditor.editor.selection.getCursor().row;
            var typed = '';
            var type = PlayEditor.editor.getSession().getTokenAt(currentLine, currentPos).type
            var tokvalue = PlayEditor.editor.getSession().getTokenAt(currentLine, currentPos).value
            if (exports.checkIfValidToken(type, tokvalue)) {
                try {
                    var tok = PlayEditor.editor.getSession().getTokenAt(currentLine, currentPos);
                    if (tok.value != undefined) {
                        typed = $.trim(tok.value);
                    } else {
                        typed = '';
                    }
                } catch (_) {
                    typed = '';
                }
                if ((currentPos - exports.autoCompleteStart) != typed.length) {
                    exports.autoCompleteStart = currentPos - typed.length;
                }
            } else {
                typed = '';
            }
            var range = new Range(currentLine, exports.autoCompleteStart, currentLine, currentPos);
            if (typed == '' || value.toLowerCase().startsWith(typed.toLowerCase())) {
                PlayEditor.editor.getSession().replace(range, value);
            }
        }
        exports.endAutoComplete();
    };

    exports.handleDirKeys = function(e) {
        if (exports.displayAutoComplete) {
            if(e.charCode == 32 || e.keyCode == 32) {
                exports.endAutoComplete();
            }
            if(e.charCode == 13 || e.keyCode == 13) {
                e.preventDefault();
                exports.insertAutoComplete();
            }
        }
    };

    exports.ctrlSpaceTrigger = function(editor) {
        var tokens = [];
        var nbrRows = editor.getSession().getLength();
        for (var i = 0; i < nbrRows; i++) {
            var toks = editor.getSession().getTokens(i);
            for (var j = 0; j < toks.length; j++) {
                var type = toks[j].type;
                var value = toks[j].value;
                if (exports.checkIfValidToken(type, value)) {
                    if (tokens.indexOf(value) < 0) {
                        tokens.push(value);
                    }
                }
            }
        }
        if (!exports.displayAutoComplete) {
            exports.displayAutoComplete = true;
            exports.autoCompleteTokens = tokens;
            exports.autoCompleteStart = editor.selection.getCursor().column;
            exports.autoCompleteLine = editor.selection.getCursor().row;
            exports.autoComplete();
        } else {
            exports.endAutoComplete();
        }
    };

})(AutoComplete);
