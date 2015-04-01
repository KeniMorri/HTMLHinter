/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, brackets*/

define(function (require, exports, module) {
    "use strict";

    var CommandManager        = brackets.getModule("command/CommandManager"),
        Menus                 = brackets.getModule("command/Menus"),
        AppInit               = brackets.getModule("utils/AppInit"),
        EditorManager         = brackets.getModule("editor/EditorManager"),
        ExtensionUtils        = brackets.getModule("utils/ExtensionUtils"),
        MarkErrors            = require("errorDisplay"),
        parse                 = require("./parser"),
        showingDescription,
        errorButton,
        defaultFont,
        errorCache = {};

    ExtensionUtils.loadStyleSheet(module, "main.less");

    function main(){
        var editor = EditorManager.getActiveEditor();
        var error;
        var html;
        var errorButton;

        if(!editor || editor.document.getLanguage().getName() !== "HTML") {
            return;
        }

        html = editor.document.getText();
        error = parse(html);

        clearAllErrors();

        if(error) {
            errorCache.message = error.message;
            errorCache.line = editor._codeMirror.getDoc().posFromIndex(error.cursor).line;
            errorButton = MarkErrors.scafoldHinter(error.cursor, error.end, errorCache);
        }
    }

    //Function that clears all errors
    function clearAllErrors(){
        MarkErrors.removeHighlight(errorCache.line);
        errorCache = {};
        MarkErrors.removeButton();
        MarkErrors.hideDescription();
    }

    var toggleErrorDescription = function(editor, line){
        if(errorCache.line !== line) {
            return;
        }

        if(!showingDescription) {
            MarkErrors.showDescription(errorCache);
        } else {
            MarkErrors.hideDescription();
        }
        showingDescription = !showingDescription;
    };

    //Document changed event handler
    var documentChanged = function (editor, object) {
        if(editor){
            main();
        }
    };

    var fontChange = function(editor) {
        var currentEditor = EditorManager.getActiveEditor();
        if(currentEditor) {
            if(defaultFont != currentEditor._codeMirror.defaultTextHeight()) {
                defaultFont = currentEditor._codeMirror.defaultTextHeight();
                main();
            }
        }
    }

    //Switching editors
    var activeEditorChangeHandler = function ($event, focusedEditor, lostEditor) {
        if (lostEditor) {
            lostEditor._codeMirror.off("change", documentChanged);
        }
        if (focusedEditor) {
            focusedEditor._codeMirror.on("change", documentChanged);
        }
    };

    AppInit.appReady(function(){
        EditorManager.on("activeEditorChange", activeEditorChangeHandler);

        var currentEditor = EditorManager.getActiveEditor();
        MarkErrors.initHinter();
        currentEditor._codeMirror.on("change", documentChanged);
        defaultFont = currentEditor._codeMirror.defaultTextHeight();
        currentEditor._codeMirror.on("update", fontChange);
        errorButton = null;
    });
});

