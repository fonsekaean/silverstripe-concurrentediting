// Protect global namespace using this throwaway function.
(function($){

    var CurrentPage = {
        id: function() { return $('#Form_EditForm_ID') ? $('#Form_EditForm_ID').val() : null; },
        saveCount: function() { return $('#SiteTree_Alert') ? $('#SiteTree_Alert').attr('savecount') : null; },
        setSaveCount: function(count) { if ($('#SiteTree_Alert')) { $('#SiteTree_Alert').attr('savecount', count); } },
        isDeleted: function() { return $('#SiteTree_Alert') ? $('#SiteTree_Alert').attr('deletedfromstage') : null; }
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
        if ($('#Form_EditForm_ID') && $('#SiteTree_Alert') && !window.location.toString().match(/compareversions/)) {
            var url = "ConcurentEditingLeftAndMain_Controller/concurrentEditingPing?ID="+CurrentPage.id()+'&SaveCount='+CurrentPage.saveCount();
            $.ajax(url, {
                success: function(data) {
                    var data = eval("("+data+")");
                    var hasAlert = false;
                    switch(data.status) {
                        case 'editing':
                            if (showOverwroteMessage && data.isLastEditor) {
                                if(data.lastEditor == 'myself') {
                                    showOverwroteMessage = false;
                                    break;
                                }

                                $('#SiteTree_Alert').css({
                                    border: '2px solid #FFD324',
                                    background: '#fff6bf'
                                });
                                $('#SiteTree_Alert').html("You just overwrote the version saved by " + data.lastEditor + ".  Compare those versions " + data.compareVersionsLink);
                                setTimeout(function() { showOverwroteMessage = false; }, getSetting('overwriteDisplayDuration') * 10000);
                                break;
                            }
                            $('#SiteTree_Alert').css({
                                border: '2px solid #B5D4FE',
                                background: '#F8FAFC'
                            }).html("This page is also being edited by: "+data.names.join(', '));
                            console.log("ok");
                            saveHasBeenClicked = false;
                            hasAlert = true;
                            break;
                        case 'deleted':
                            // handle deletion by another user (but not us, or if we're already looking at a deleted version)
                            if (CurrentPage.isDeleted() == 0) {
                                strHTML = "This page has been deleted recently.";
                                strHTML += " <a href='" + data.viewDeletedUrl + "'>View</a> or <a href='" + data.restoreDeletedUrl + "'>restore</a>.";
                                $('#SiteTree_Alert').css({
                                    border: '2px solid #ffd324',
                                    background: '#fff6bf'
                                }).html(strHTML);
                                jQuery('#form_actions_right input').attr("disabled", 'disabled');
                                jQuery('#form_actions_right').fadeTo("slow", 0.25);
                                hasAlert = true;
                            }
                            saveHasBeenClicked = false;
                            break;
                        case 'not_current_version':
                            // handle another user publishing
                            strHTML = "This page has been saved since you opened it. You may want to reload it, or risk overwriting changes.";
                            $('#SiteTree_Alert').css({
                                border: '2px solid #FFD324',
                                background: '#fff6bf'
                            }).html(strHTML);
                            hasAlert = true;
                            showOverwroteMessage = true;
                            saveHasBeenClicked = false;
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

        $('#Form_EditForm').entwine({
            onmatch: function(){
                //this.observeMethod('PageLoaded', this.adminPageHandler);
                //this.observeMethod('BeforeSave', this.beforeSave);
                $('#SiteTree_Alert').hide();
                this.adminPageHandler();
            },
            adminPageHandler: function(){
                if (!timerID && ($('#Form_EditForm_ID') && $('#SiteTree_Alert'))) {
                    timerID = setInterval(pingFunction, getSetting('pagePingInterval')*1000);
                }
            },
            beforeSave: function(){
                saveHasBeenClicked = true;
            }
        });

    });




})(jQuery); // end of Namespace
