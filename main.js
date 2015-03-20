/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, brackets*/

define(function (require, exports, module) {
    "use strict";

    var CommandManager        = brackets.getModule("command/CommandManager"),
        Menus                 = brackets.getModule("command/Menus"),
        AppInit               = brackets.getModule("utils/AppInit"),
        EditorManager         = brackets.getModule("editor/EditorManager"),
        ExtensionUtils        = brackets.getModule("utils/ExtensionUtils"),
        BottomDisplay         = require("BottomDisplayPanal"),
        MarkErrors            = require("errorDisplay"),
        parse                 = require("./parser"),
        showingDescription,
        BottomDisplayVar,
        errorCache = {};

    ExtensionUtils.loadStyleSheet(module, "main.less");

    function main(){
        var editor = EditorManager.getActiveEditor();
        var error;
        var html;

        if(!editor || editor.document.getLanguage().getName() !== "HTML") {
            return;
        }

        html = editor.document.getText();
        error = parse(html);

        clearAllErrors();

        if(error) {
            errorCache.message = error.message;
            errorCache.line = editor._codeMirror.getDoc().posFromIndex(error.cursor).line;
            MarkErrors.showButton(errorCache.line);
            MarkErrors.highlight(errorCache.line);
        }

        BottomDisplayVar.update(html);
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

    //Switching editors
    var activeEditorChangeHandler = function ($event, focusedEditor, lostEditor) {
        if (lostEditor) {
            lostEditor._codeMirror.off("gutterClick", toggleErrorDescription);
            lostEditor._codeMirror.off("change", documentChanged);
        }

        if (focusedEditor) {
            focusedEditor._codeMirror.on("gutterClick", toggleErrorDescription);
            focusedEditor._codeMirror.on("change", documentChanged);
        }

    };

    //Function that shows panel
    function showpan() {
        BottomDisplayVar.panelRender(true);
    }
    // First, register a command - a UI-less object associating an id to a handler
    var MY_COMMAND_ID = "Show_Slowparse_Panel"; // package-style naming to avoid collisions
    CommandManager.register("Show Parsed HTML Panel", MY_COMMAND_ID, showpan);

    // Then create a menu item bound to the command
    // The label of the menu item is the name we gave the command (see above)
    var menu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
    menu.addMenuItem(MY_COMMAND_ID,  "Ctrl-Alt-U");

    AppInit.appReady(function(){
        BottomDisplayVar = new BottomDisplay();
        EditorManager.on("activeEditorChange", activeEditorChangeHandler);

        var currentEditor = EditorManager.getActiveEditor();
        MarkErrors.initGutter();
        currentEditor._codeMirror.on("change", documentChanged);
        currentEditor._codeMirror.on("gutterClick", toggleErrorDescription);
    });
});

