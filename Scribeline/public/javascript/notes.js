function setDocDate() {
    var language = window.navigator.userLanguage || window.navigator.language;
    var date = new Date;
    var options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };
    var formatted_date = date.toLocaleDateString(language, options);
    $('#iddate').html('<em><b>'+formatted_date+'</b></em><br /><br />');
}
window.onload = function() { // Doing it the old fashioned non-jQuery way
    setDocDate(); // Set date on new doc
    var autosave = window.setInterval(autoSaveArea, 60000); // Start autosaver, every min
}
function triggerAlert () {
    createAlert("Tip<br />", 'Welcome to Scribeline Editor! To add a layer, press Ctrl+Y.\
    To remove a layer, simply press Ctrl+U. Save as you go,\
    save as or open a new file to get started right away! <br/>\
    <b>Keybinds:</b>\
    <ul>\
    <li>Ctrl+E to reduce area size</li>\
    <li>Ctrl+S to save</li>\
    <li>Ctrl+B to <b>bolden</b></li>\
    </ul> '); // Located at /javascript/alert.js

}

function getPrecedingNodeCursor() {
    // Gets node preceding the cursor in #area
    var selection
    if (window.getSelection){
        selection = window.getSelection();}
    else if (document.selection && document.selection.type != "Control"){
        selection = document.selection;}

    var anchor_node = selection.anchorNode; //current node on which cursor is positioned
    var previous_node = anchor_node.previousSibling;
    var next_node = anchor_node.nextSibling;
    return previous_node;
}

function getCurrLevel (item) {
    $(item).parents('ul').length; // $(item) might need to be replaced with item
}
var currLevel = 0; // WILL BE DEPRECATED IN FAVOR OF ANCHOR NODE AND PARENT COUNTER
var height = 450;
var textHeight_s = 5; // Actual character height
var textHeight = textHeight_s + 5; // Approx line height
$('#area').css('font-size', textHeight_s+"px");
function chkMain() {
    console.log('chkMain called!');
    if (currLevel>0) {
        cursorPasteHTML("</li><li id='chkmaincr'>");
        console.log('lied');
    }
    else {
        cursorPasteHTML("<br />");
        console.log('bred')
    }
    height += textHeight;
    $('#area').css('height', height+"px")
    cursorManager.setEndOfContenteditable($('#area'));

}
function updateInDocTitle() {
    var docTitle = $('#dtitle').val();
    $('#idtitle').html("<h1>"+docTitle+"</h1><br />");
    console.log('Updating doc title.')
    return;
}

function addLevel() {
    //cursorPasteHTML('<ul><li>');
    insertHtmlAtCursor("<ul><li>");
    currLevel++;
    cursorManager.setEndOfContenteditable($('#area'));
}
function shortenField() {
    height -= textHeight;
    $('#area').css('height', height+"px");
    cursorManager.setEndOfContenteditable($('#area'));
}
function delLevel() {
    insertHtmlAtCursor("</ul>");
    currLevel--;
    cursorManager.setEndOfContenteditable($('#area'));

}

function saveArea() {
    // Saves text/outline onto MongoDB
    var docTitle = $("#dtitle").val();
    var docContent = $("#area").html();
    var request = $.ajax({
        url: "/action-ep",
        type: "POST",
        data: {'action': "save", 'title': docTitle, 'content': docContent, 'id': currID},
        dataType: "html"
    });
    $("#save").html('<span><img src="/images/loading.gif" width="20px" height="20px">&nbsp;&nbsp; Saving...</span>');
    request.done(function(msg) {
       if(msg=='OK') {
           $("#save").html('<i class="fa fa-book">    Save</i>');
           stopAutoSave = false;
       }
       else if(msg.toLowerCase().search("error")>0) {
           createAlert('<i class="fa fa-ban"></i> Alert</br >', msg);
           $("#save").html('<i class="fa fa-book">    Save</i>');
       }
       else {
           createAlert('<i class="fa fa-ban"></i> Alert</br >', "Generic unhandled error. Try again later. "+msg);
           $("#save").html('<i class="fa fa-book">    Save</i>');

       }
    });

    request.fail(function(jqXHR, textStatus) {
        createAlert('<i class="fa fa-ban"></i> Alert</br >', "Could not reach server. Try again later.");
        $("#save").html('<i class="fa fa-book">    Save</i>');
    });
}
var autoSaveAlerted = false;
var stopAutoSave; // Stop autosaving if something is broken
function autoSaveArea() {
    if (stopAutoSave == true) {
        return; // Wait until a successful save before autosaving
        //          if an error occured
    }
    // Saves text/outline onto MongoDB
    var docTitle = $("#dtitle").val();
    var docContent = $("#area").html();
    var request = $.ajax({
        url: "/action-ep",
        type: "POST",
        data: {'action': "save", 'title': docTitle, 'content': docContent, 'id': currID},
        dataType: "html"
    });
    $("#save").html('<span><img src="/images/loading.gif" width="20px" height="20px">&nbsp;&nbsp; Autosaving...</span>');
    request.done(function(msg) {
       if(msg=='OK') {
           $("#save").html('<i class="fa fa-book">    Save</i>');
           stopAutoSave = false; // Turn back on autosaving

       }
       else if(msg.toLowerCase().search("error")>0) {
           createAlert('<i class="fa fa-ban"></i> Alert</br >', msg);
           $("#save").html('<i class="fa fa-book">    Save</i>');
           autoSaveAlerted = true;
           stopAutoSave = true;
       }
       else {
           createAlert('<i class="fa fa-ban"></i> Alert</br >', "Generic unhandled error. Try again later. "+msg+" <br />Autosave <span style='color:red'>paused</span> until successful manual save.");
           $("#save").html('<i class="fa fa-book">    Save</i>');
           autoSaveAlerted = true;
           stopAutoSave = true;

       }
    });

    request.fail(function(jqXHR, textStatus) {
        createAlert('<i class="fa fa-ban"></i> Alert</br >', "Could not reach server. Try again later. Autosave <span style='color:red'>paused</span> until successful manual save.");
        $("#save").html('<i class="fa fa-book">    Save</i>');
        autoSaveAlerted = true;
        stopAutoSave = true;

    });
}

function newArea() {
    $('#dtitle').val("");
    $('#area').html('<div id="idtitle"></div>\
    <div id="iddate"></div>\
    Start typing here...');
    setDocDate(); // set doc date
    var currID = guid(); // new doc ID
    createAlert('', "New document created!");
}


function createPrint() {
    var css = "@media print {\
                  body * {\
                    visibility: hidden;\
                }\
                  #section-to-print, #section-to-print * {\
                    visibility: visible;\
                }\
                  #section-to-print {\
                    position: absolute;\
                    left: 0;\
                    top: 0;\
                }\
            }";

    var htmlCSS = "<html><head><style>"+css+"</style></head><body>"+$('#area').html()+"</body></html>";
    // TODO: themes for printing and editing in general


}

// Also requires jQuery and Bootstrap JS