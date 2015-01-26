define(function (require) {
    "use strict";
    var Resizer             = brackets.getModule('utils/Resizer'),
        Dialogs             = brackets.getModule('widgets/Dialogs'),
        DefaultDialogs      = brackets.getModule('widgets/DefaultDialogs'),
        WorkspaceManager    = brackets.getModule("view/WorkspaceManager");
    var BottomHTML = require('text!BottomDisplay.html'),
        ErrorHTML = require('text!ErrorDisplay.html');
    function BottomDisplay()
    {
        console.log('Bottom display Construtor');
        var that = this;
        WorkspaceManager.createBottomPanel('Bottom.panel', $(BottomHTML));
        this._panel = $('#bottom-panel-gui');
        this._panel.on('click', '.close', function () { that.panelRender(false); });
        //Resizer.show(this._panel);
    }
    BottomDisplay.prototype.panelRender = function (isVisible)
    {
        if(isVisible)
        {
            Resizer.show(this._panel);
        }
        else
        {
            Resizer.hide(this._panel);
        }
    };
    BottomDisplay.prototype.update = function (text)
    {
        //var renderedError = Mustache.render(ErrorHTML, { 'ErrorText': text });
        var renderedError = $(text);
        this._panel.find('.table-container').empty().append($(renderedError));
    }
    BottomDisplay.prototype._onClose = function ()
    {
        console.log("Close");
        Resizer.hide(this._panel);
    };
    return BottomDisplay
}); 