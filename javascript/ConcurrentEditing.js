// Protect global namespace using this throwaway function.
(function($){

    var CurrentPage = {
        id: function() {
            var idString = $('#Form_ItemEditForm').attr("action").split('/');
            return $('#Form_ItemEditForm') ? idString[7] : null;
        },
        lastEdit: function() { return $('#SiteTree_Alert') ? $('#SiteTree_Alert').attr('lastedit') : null; },
        setSaveCount: function(count) { if ($('#SiteTree_Alert')) { $('#SiteTree_Alert').attr('savecount', count); } },
        isDeleted: function() { return $('#SiteTree_Alert') ? $('#SiteTree_Alert').attr('deletedfromstage') : null; },
        getObject: function() {
            var idString = $('#Form_ItemEditForm').attr("action").split('/');
            //console.log(idString);
            return  $('#Form_ItemEditForm') ? idString[5] : null;
        }
    };


    var timerID = null;

    var saveHasBeenClicked = false;
    var showOverwroteMessage = false;

    function getSetting(attr) {
        return $('#SiteTree_Alert').attr(attr);
    }

    /**
     * This function is called every `pagePingInterval` seconds, and checks the
     * concurrent editing status.
     */
    function pingFunction() {
        if ($('#Form_ItemEditForm') && $('#SiteTree_Alert') && !window.location.toString().match(/compareversions/)) {
            var url = "ConcurentEditingLeftAndMain_Controller/concurrentEditingPing?Object="+CurrentPage.getObject()+"&ID="+CurrentPage.id()+'&lastedit='+CurrentPage.lastEdit();
            $.ajax(url, {
                success: function(data) {
                    var data = eval("("+data+")");
                    var hasAlert = false;
                    switch(data.status) {
                        case 'notediting':
                            $('#SiteTree_Alert').html("");
                        case 'editing':
                            if(data.isLastEditor){
                                $('#page-title-heading').append($('#SiteTree_Alert').html("This record is also being edited by "+data.names.join(', ')+" "+" You are the last editor "));
                            }else{
                                if(data.edit){
                                    $('#page-title-heading').append( $('#SiteTree_Alert').html(" This record has been saved since you opened it. You may want to reload it, or risk overwriting changes. "));
                                    $('#SiteTree_Alert').attr("lastedit",data.editId);
                                }else{
                                    $('#page-title-heading').append($('#SiteTree_Alert').html("This record is also being edited by "+data.names.join(', ')+" "+ " you are not the last editor "));
                                }
                            }
                            saveHasBeenClicked = false;
                            hasAlert = true;

                            break;
                        case 'not_found':
                            break;
                    }

                    if (hasAlert) {
                        $('#SiteTree_Alert').show();
                    } else {
                        $('#SiteTree_Alert').hide();
                    }
                },
                onComplete: function(transport) {
                    if(transport.status >= 400) location.href = location.href;
                }
            });
        }
    } // pingFunction

    /*
     * Register the SiteTree 'onload' function, called whenever a SiteTree page is
     * opened or reloaded in the CMS.
     */

    $.entwine('ConcurrentEditingNamespace', function($){

        $('#Form_ItemEditForm').entwine({
            onmatch: function(){
                $('#SiteTree_Alert').hide();
                this.adminPageHandler();
            },
            adminPageHandler: function(){
                if (!timerID && ($('#Form_ItemEditForm_ID') && $('#SiteTree_Alert'))) {
                    pingFunction();
                    timerID = setInterval(pingFunction, 1000 * $('#SiteTree_Alert').attr('pagepinginterval'));
                }
            },
            beforeSave: function(){
                saveHasBeenClicked = true;
            }
        });

    });




})(jQuery); // end of Namespace
