/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, brackets, $, document, Mustache*/

define(function (require, exports, module) {
    "use strict";

    var EditorManager  = brackets.getModule("editor/EditorManager"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        lineWidgetHTML = require("text!inlineWidget.html"),
        currentErrorWidget;
    var errorToggle;
    var errorPostion;
    
    var lastGutterPointer;
    
    var isShowingDescription;
    var errorObject;
    

    ExtensionUtils.loadStyleSheet(module, "main.less");
    require("tooltipsy.source");

    function getActiveEditor() {
        return EditorManager.getActiveEditor();
    }

    function getCodeMirror() {
        return getActiveEditor()._codeMirror;
    }

    function initHinter() {
        //getCodeMirror().setOption("gutters", ["errors"]);
        errorToggle = document.createElement("div");
        errorPostion = null;
        lastGutterPointer = null;
        isShowingDescription = false;
        errorObject = null;
    }

    function scafoldHinter(errorStart, errorEnd, errorObj) {
        //Setup neccessary variables
        errorPostion = getCodeMirror().posFromIndex(errorStart);
        errorObject = errorObj;
        //Spawn button
        showButton();
        //Setup Gutter Highlight
        highlight(errorPostion.line);
        //Setup Widght with error
        //showDescription(errorObj);
        errorToggle.onclick = function() {
            if(!isShowingDescription) {
                showDescription(errorObj);
            }
            else {
                hideDescription();
            }
            isShowingDescription = !isShowingDescription;
        }
        return $(errorToggle);
    }

    function cleanup() {
        removeButton();
        removeHighlight();
        isShowingDescription = false;
    }

    function highlight() {
        if(!errorPostion.line) {
            return;
        }
        getCodeMirror().getDoc().addLineClass(errorPostion.line, "background", "errorHighlight");
    }

    function removeHighlight(line) {
        if(!line) {
            return;
        }
        getCodeMirror().getDoc().removeLineClass(line, "background", "errorHighlight");
    }



    //Function that adds a button on the gutter (on given line nubmer) next to the line numbers
    function showButton(){
        getCodeMirror().addWidget(errorPostion, errorToggle, false);
        $(errorToggle).attr("class", "hint-marker-positioning hint-marker-error").removeClass("hidden");
        //Show tooltips message
        $(".hint-marker-positioning").tooltipsy({content : "Click error icon for details", alignTo: "cursor", offset: [10, -10]});
    }

    // Function that removes gutter button
    function removeButton(){
        if (errorToggle.parentNode) {
          $(errorToggle).remove();
        }
        //getCodeMirror().clearGutter("hint-marker-positioning");

        //Destroy tooltips instance
        var tooltips = $(".hint-marker-positioning").data("tooltipsy");
        if(tooltips) {
            tooltips.destroy();
        }
        isShowingDescription = false;
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

    exports.initHinter = initHinter;
    exports.scafoldHinter = scafoldHinter;
    exports.removeButton = removeButton;
    exports.highlight = highlight;
    exports.removeHighlight = removeHighlight;
    exports.showDescription = showDescription;
    exports.hideDescription = hideDescription;
});
