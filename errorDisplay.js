/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, brackets, $, document, Mustache*/

define(function (require, exports, module) {
    "use strict";

    var EditorManager  = brackets.getModule("editor/EditorManager"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        lineWidgetHTML = require("text!inlineWidget.html"),
        currentErrorWidget;

    ExtensionUtils.loadStyleSheet(module, "main.less");
    require("tooltipsy.source");

    function getActiveEditor() {
        return EditorManager.getActiveEditor();
    }

    function getCodeMirror() {
        return getActiveEditor()._codeMirror;
    }

    function initGutter() {
        getCodeMirror().setOption("gutters", ["errors"]);
    }

    function highlight(line) {
        if(!line) {
           return;
        }

        getCodeMirror().getDoc().addLineClass(line, "background", "errorHighlight");
    }

    function removeHighlight(line) {
        if(!line) {
           return;
        }

        getCodeMirror().getDoc().removeLineClass(line, "background", "errorHighlight");
    }

    //Function that adds a button on the gutter (on given line nubmer) next to the line numbers
    function showButton(line){
        var errorMarker = document.createElement("div");
        errorMarker.className = "errorButton errorText";
        errorMarker.innerHTML = "!";

        getCodeMirror().setGutterMarker(line, "errors", errorMarker);

        //Show tooltips message
        $(".errors").tooltipsy({content : "Click error icon for details", alignTo: "cursor", offset: [10, -10]});
    }

    // Function that removes gutter button
    function removeButton(){
        getCodeMirror().clearGutter("errors");

        //Destroy tooltips instance
        var tooltips = $(".errors").data("tooltipsy");
        if(tooltips) {
           tooltips.destroy();
        }
    }

    function showDescription(error) {
        var description = document.createElement("div");
        description.className = "errorPanel";
        description.innerHTML = Mustache.render(lineWidgetHTML, {"error": error.message});
        var options = {coverGutter: false, noHScroll: false, above: false, showIfHidden: false};

        currentErrorWidget = getCodeMirror().addLineWidget(error.line, description, options);
    }

    function hideDescription() {
        if(!currentErrorWidget) {
            return;
        }

        currentErrorWidget.clear();
        currentErrorWidget = null;
    }

    exports.initGutter = initGutter;
    exports.showButton = showButton;
    exports.removeButton = removeButton;
    exports.highlight = highlight;
    exports.removeHighlight = removeHighlight;
    exports.showDescription = showDescription;
    exports.hideDescription = hideDescription;
});
