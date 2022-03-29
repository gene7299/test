var setPlaylistScheduler1 = {};
var playPlaylist1 = {};
var planSchedulerCalculation1 = '';
var startedPlaylist = 0;
var startedTextThickering = 0;
var textWidgetMarqueeThickeringVar = {};
var videoItems = {};
var videoTimeout;
var portraitLeft = 0;
var gplay = null;
var gpaused = false;
var gaudio = null;
var mediaPath = null;
var audioAdded = 0;
var defaultLanguage = "";
var selectedLanguage = "";
var srcwidth, srcheight;
var GuestName, RoomID = null;
var player;
var playCount = 0; // counter variable for the playlist in mb96

jQuery(document).ready(function($) {

    mediaPath =  $(".media_path").val();
    defaultLanguage = $(".default-language").val();
    if($('.export-view').length){
        var lang = $(".enabled-language").val();
        selectedLanguage = ($(".enabled-language").val().split(',').length > 0) ? JSON.parse(lang) : lang;
    }
    srcwidth = $(window).outerWidth();
    srcheight = $(window).outerHeight();
    $('.widget .object-wrapper').css('position', 'absolute !important');
    //Calculating the menu
    var plan_scheduler = new Array();
    var playlistItems = new Array();
    var pagePlanScheduler = 0;
    //   var menu = $("#pre-menu-container").width();
    if ($("#parent-div").hasClass('portrait')) {
        portraitLeft = 1;
    }
    var lanCount = $(".langcount").val();
    $(".language-object").attr("lang-count", lanCount);

    //Adding number of language icon in the listview
    $(".language-object").each(function() {
        var id = $(this).attr("id");
        var rowCount = calculateLIsInRow(id);
        $("#" + id).attr("row", rowCount);
    });


    //adding the initial size class to each span which applied the font size
    //parent font size is effectiong the span font size so we added the class and applied to initial size
    $(".widget").each(function() {
        applyClassToSpanForFontSize($(this).attr("id"));
    });


    //Adding classes for thickering li&div
    $(".text-object .tickering div").addClass("thkwrap");
    $(".text-object .tickering li").addClass("thkwrap");
    //Loading default Text
    var selected = $('.widget .link select').val();
    //Hiding the all language text and showing default text
    $('.text-object').each(function() {
        $('.text-object .content-wrapper').hide();
        $('.text-object .content-wrapper.'+defaultLanguage).show();
    });

    /**  page plan scheduler  **/
    if ($(".website-page-scheduler").val() == 1) {
        //Convertung the plan page scheduler data to array
        var page_scheduler = jQuery.parseJSON($(".page-scheduler-data").text());
        /**
        calling page scheduler functionalitu
        default plan scheduler details, plan default type, position, start/stop
        */
        playPagePlanScheduler(page_scheduler['default'], "default", 0, 0);
        //Check if planned scheduler is added
        if ($(".planned-scheduler-exist").val() == 1) {
            //Call planned scheduler checker
            planpageSchedulerCalculation(page_scheduler);
        }
    }
});

function calculateLIsInRow(id) {
    var lisInRow = 0;
    $("#" + id + ' .language-selection ul li').each(function() {
        if ($(this).prev().length > 0) {
            if ($(this).position().top != $(this).prev().position().top) return false;
            lisInRow++;
        } else {
            lisInRow++;
        }
    });
    return lisInRow;
}



function applyClassToSpanForFontSize(id) {
    var fontSize = "font-size";
    if ($("#" + id).attr("style").indexOf("font-size") == -1 || $("#" + id).css("font-size") == "16px") {
        return false;
    }

    $('.text-object .content-wrapper span').each(function() {
        var html = $(this).parent().html();
        var sizePos = html.indexOf(fontSize);
        var spanPos = html.indexOf("span");
        if (sizePos != -1 && ((sizePos - spanPos) < 15)) {
            $(this).addClass("font-size-initial");
        }
    });
}

/**  Checking plan page scheduler if user added any plan scheduler for page */
function planpageSchedulerCalculation(page_scheduler) {
    var def = 1;
    //Loop throught all page schedulers
    $.each(page_scheduler, function(key, value1) {
        //get current page scheduler running
        var psch = $(".current-page-scheduler").val();
        //Check plan scheduler id scheduler type is not default
        if (key != 'default') {
            //Calling the inbuild ClockControl
            var da = ClockControl();
            //var da = new Date(mDate);
            var date = da.getTime();
            var stdate = new Date(value1['start_date']).getTime();
            var sodate = new Date(value1['stop_date']).getTime();
            //comparing the date
            if ((date > stdate) && (date < sodate)) {
                var hours = da.getHours();
                var min = da.getMinutes();
                var cu_time = (hours * 60) + min;
                var stt = value1['start_time'].split(':');
                var st_time = ((stt[0] * 60) + (stt[1] * 1));
                var sto = value1['stop_time'].split(':');
                var so_time = ((sto[0] * 60) + (sto[1] * 1) - 1);
                //TIme compare
                if ((st_time <= cu_time) && (so_time >= cu_time)) {
                    //Checking week day
                    var day = da.getDay() + 1;
                    var found = 0;
                    for (var i = 0; i < value1['days'].length; i++) {
                        if (day == value1['days'][i]) {
                            found = 1;
                        }
                    }
                    //Checking the weekday
                    if (found) {
                        def = 0;
                        if (psch != key) {
                            //Stopping the previous page scheduler and start new one
                            console.log(psch + '<---cancelling the previous page scheduler & running new page scheduler--->' + key);
                            $('.current-page-scheduler').val(key);
                            //Stop previous scheduler
                            playPagePlanScheduler("", "", 0, 1)
                                //Start new scheduler
                            playPagePlanScheduler(page_scheduler[key], key, 0, 0);
                        } //End of not equal scheduler
                        return false;
                        //  break start;
                    }
                } //End if time compare

            } //End of date commpare

        } //End if of not default

    }); //End Each of particualer scheduler

    //Checking if no planning scheduler playing then play default
    if (def) {
        psch = $(".current-page-scheduler").val();
        key = "default";
        if (psch != key) {
            console.log(psch + '<---cancelling the previous page scheduler defaultc & running new page scheduler--->' + key);
            $('.current-page-scheduler').val("default");
            playPagePlanScheduler("", "", 0, 1)
            playPagePlanScheduler(page_scheduler[key], key, 0, 0);
        }
    }

    //Call the page scheduler Calculating again after 5 secs
    setTimeout(function() {
        planpageSchedulerCalculation(page_scheduler);
    }, 5000); //Time out

    //  return false;
} //End of planSchedulerCalculation

/** Starting the page scheduler by waiting the time based on user selection*/
function playPagePlanScheduler(pl_details, key, pos, stop) {
    if (stop == 1) {
        clearTimeout(pagePlanScheduler);
    } else {
        if (pos == pl_details['pages'].length) {
            //Looping the playlist again if all the pages in list is over
            playPagePlanScheduler(pl_details, key, 0, 0);
        } else {
            //Calling the page switch function to change the page based on plan
            //var pageid = $("#pre-menu-container li#" + pl_details['pages'][pos]["id"]).attr('pval');
            var pageid =  pl_details['pages'][pos]["id"].replace("menu-page-", "");
            PageSwitch(pageid, 'menu');
            //Settings the delay of page to wait until next page show
            var delay = parseInt(pl_details['pages'][pos]["duration"]) * 1000;
            pagePlanScheduler = setTimeout(function() {
                pos++;
                if ($(".current-page-scheduler").val() == key) {
                    playPagePlanScheduler(pl_details, key, pos, 0);
                } else {
                    playPagePlanScheduler(pl_details, key, pos, 1);
                }
            }, delay);
        }
    }
}


/** this function is to play the all the items in playlist based on the object type image/video*/
function playPlaylist(playlistItems, onid, sch, snid, pl_details, count, i, stop, currentPlaylist) {
    if (stop == 1) {
        //Clearing the previous calling function
        $.each(playPlaylist1, function(key, value) {
            clearTimeout(playPlaylist1[key]);
        });
    } else {
        startedPlaylist = 1;
        //Checking the playlist item exist or not
        if (count != i) {
            //Getting the playlist item details
            var pl_item = playlistItems[onid][snid]['item'][i]['id'];
            var pl = ($("#"+playlistItems[onid][snid]['id']).parent().hasClass('music-object')) ? "#"+playlistItems[onid][snid]['id'] : ".page-active #"+playlistItems[onid][snid]['id'];
            //Checking if current playlist page is active or not
            if (!$(pl).parent().parent().parent().hasClass("page-active") && !$(pl).parent().hasClass('music-object')) {
                return false;
            }
            //default hide and stop showing all the files
            $(pl + ' .playlist').hide();
            $(pl + ' video').each(function() {
                if(checkIfmb96Platform()){
                    pauseVideoAfterPlaybackMonitors(false);
                }else if(isLatestMonitor){
                    var vid = $(this).attr("id");
                    var x = document.getElementById(vid);
                    x.pause();
                }else{
                    $(this).remove();
                }
            });
            //remove the currently added audio files and add latest playing only


            //Checking the current playlist should stop or continue
            playPlaylist1[1] = setTimeout(function() {
                var c_nid = $('.current-playlist-playlist-' + onid).val();
                if (c_nid != sch) {
                    if ($(pl).find('video#' + pl_item).hasClass('video')) {
                        // $(pl).find('#' + pl_item).trigger('pause');
                        if(checkIfmb96Platform()){
                            pauseVideoAfterPlaybackMonitors(false);
                        }else if(isLatestMonitor){
                            var x = document.getElementById(pl_item);
                            x.pause();
                        }else{
                             $(pl).find('video#' + pl_item).remove();
                        }
                    }
                    if ($(pl).find('audio#' + pl_item).hasClass('audio')) {
                          if(isLatestMonitor){
                            var x = document.getElementById(pl_item);
                            x.pause();
                        }else{
                             $(pl).find('audio#' + pl_item).remove();
                        }
                    }
                    return false;
                }
            }, 1000);
            //console.log("playing date :  "+ Date());
            //Finding the particualer item to show
            $(pl).find('#' + pl_item).show();
            //playing the video if video tag exist then it load and start playing
            if ($(pl).find('.' + pl_item).hasClass('video')) {
                // 3550Q, 4550D, 3651T, 3452T  for all these platforms - we have playing video issue hence it needs separate flow to play it
                if(checkIfmb96Platform()){
                    ChangeVideoSourceOnPlayback(pl, pl_item, playlistItems, onid, sch, snid, pl_details, count, i, stop, currentPlaylist);
                } else {
                    $(pl).find('.' + pl_item).show();
                    var src = $(pl + " ." + pl_item).attr("src");
                    var css = $(pl + " ." + pl_item).attr("css");
                    $(pl).find('.' + pl_item).show();
                  if ($("video#" + pl_item).length) {
                      
                        var x = document.getElementById(pl_item);
                    x.currentTime = 0;
                    if (navigator.userAgent.indexOf("Opera/9.80") > -1 
                    || navigator.userAgent.indexOf("BDL4550D") > -1) {
                        isOldVideoLoad = true;
                      }
                      if (isOldVideoLoad) {
                        $(pl + " video#" + pl_item).load();
                        $(pl + ' video#' + pl_item).trigger('play');
                      }
                        x.play();
                    }else{
                       var html1 = '<video id="' + pl_item + '" style="' + css + '"><source src="' + src + '" type="video/mp4"><source src="' + src + '" type="video/ogg"><source src="' + src + '" type="video/mov"></video>';
                       $(pl).find("." + pl_item).append(html1);
                       $(pl).find('#' + pl_item).show();
                       $(pl + ' video#' + pl_item).load();
                       $(pl + ' video#' + pl_item).trigger('play');
                  }
                    var vid = document.getElementById(pl_item);
                    vid.onended = function(){
                        i++;
                        var c_nid = $('.current-playlist-playlist-' + onid).val();
                        if (c_nid == sch) {
                            if(i != count){
                                playPlaylist(playlistItems, onid, sch, snid, pl_details, count, i, stop, currentPlaylist);
                            }else{
    
                                var music = MusicPlaylist({
                                    currentPlaylist:currentPlaylist
                                });
                                music.playnextPlaylist(playlistItems, onid, sch, pl_details, stop, currentPlaylist, 'video');
                            }
    
                        } else {
                            return false;
                        }
                    }
                }
                
            }else if($(pl).find('.' + pl_item).hasClass('audio')){
                //checking first wheather playlist is global or not
                var masterPlaylist = $(pl).parent().attr('master');
                //creating the instance of the music playlist class
                var opts = {
                    currentPlaylist : currentPlaylist,
                    };
                var  music = MusicPlaylist(opts);
                //checking wheather the current page can play the music or not
                var check1 = music.check_precedence_for_music("global", $('.page-active').attr('pageid'));
                if(check1){
                    var check2 = music.check_precedence_for_music("local", $('.page-active').attr('pageid'));
                    if(check2){
                        if(masterPlaylist == "top" || masterPlaylist == "bottom"){
                            //checking if any global music is playing in the background or not
                            // if not then plyaing the current pl_item
                            if(!gplay){
                                //call the function from music class to play the audio
                                music.play_music_playlist(pl, pl_item, true);
                                var aid = document.getElementById(pl_item);
                                music.AudioOnEnd(aid, playlistItems, onid, sch, snid, pl_details, count, i, stop, currentPlaylist);

                            }else{
                                // if it has already started playing the playlist then starting from the point it stopped playing
                                // gpaused is used to check if any global music is paused in background while switching the pages
                                if(gpaused){
                                    i = gplay.split('-')[2];
                                    aid = gaudio;
                                    gaudio.load();
                                    gaudio.play();
                                    gpaused = false;
                                    //calling the on end event to trigger when song is done playing.
                                    music.AudioOnEnd(aid, playlistItems, onid, sch, snid, pl_details, count, i, stop, currentPlaylist);

                                }
                            }
                            //on end start the next song

                    }
                }else{
                        //handle the normal playlist functionality here
                        if(masterPlaylist == "0" || masterPlaylist == undefined){
                            music.play_music_playlist(pl, pl_item, true);
                            var aid = document.getElementById(pl_item);
                            music.AudioOnEnd(aid, playlistItems, onid, sch, snid, pl_details, count, i, stop, currentPlaylist);
                        }
                    }
                }

            }else{
                //Calculating gthe delay of each item and waiting for next item to show
            var delay = playlistItems[onid][snid]['item'][i]['duration'];
            var c_count = $('.current-playlist-playlist-' + onid).attr("count");
            playPlaylist1[c_count] = setTimeout(function() {
                i++;
                if (checkIfmb96Platform()){
                    playCount++;
                    playCount = (playCount != count) ? playCount : 0;
                    i = playCount;
                }
                var c_nid = $('.current-playlist-playlist-' + onid).val();
                if (c_nid == sch) {
                    playPlaylist(playlistItems, onid, sch, snid, pl_details, count, i, stop);
                } else {
                    return false;
                }
            }, delay);
            }
        } else {
            $(pl + ' .playlist').hide();
        }
    }
}

//Sending the scheduler playlist
//starting the scheduled here
//It start eith object id and scheduler nid
/** It will start looping all the playlist in scheduler and calling other function to to show all the items in playlist */
function setPlaylistScheduler(playlistItems, onid, sch, pl_details, val, stop) {
    //checking if scheduler is exist
    if (pl_details['plan'] == null && stop == 0) {
        startedPlaylist = 0;
        return false;
    }
    //Stopping all scheduler playlist on page change
    if (stop == 1) {
        startedPlaylist = 0;
        $.each(setPlaylistScheduler1, function(key, value) {
            clearTimeout(setPlaylistScheduler1[key]);
        });
    } else {
        startedPlaylist = 1;
        if (val == pl_details['plan'].length) {
            //Looping the playlists again in scheduler
            setPlaylistScheduler(playlistItems, onid, sch, pl_details, 0, stop);
        } else if(playlistItems[onid][pl_details['plan'][val]['nid']]['item'][0]['type'] != "audio"){
            //default playlist playling
            //Calculating tje delay of each playlist scheduler and settings the delay value in variable
            var count = pl_details['plan'][val]['count'];
            var delay = 0;
            for (var j = 0; j < playlistItems[onid][pl_details['plan'][val]['nid']]['item'].length; j++) {
                delay = delay + playlistItems[onid][pl_details['plan'][val]['nid']]['item'][j]['duration'];
            }

            //Checking current playlist should play or stop
            setPlaylistScheduler1[1] = setTimeout(function() {
                var c_nid = $('.current-playlist-playlist-' + onid).val();
                if (c_nid != sch) {
                    return false;
                }
            }, 1000);
            //Calling the playlist function to playcomplete function
            var val1 = playPlaylist(playlistItems, onid, sch, pl_details['plan'][val]['nid'], pl_details, count, 0, stop, val);
            //Waiting for particualer playlist to finish there job
            var c_count = $('.current-playlist-playlist-' + onid).attr("count");
            if(!checkIfmb96Platform){
                setPlaylistScheduler1[c_count] = setTimeout(function() {
                    val++;
                    var c_nid = $('.current-playlist-playlist-' + onid).val();
                    if (c_nid == sch) {
                        setPlaylistScheduler(playlistItems, onid, sch, pl_details, val, stop);
                    } else {
                        return false;
                    }
                }, delay);
            }
        }else{
            var count = pl_details['plan'][val]['count'];
            playPlaylist(playlistItems, onid, sch, pl_details['plan'][val]['nid'], pl_details, count, 0, stop, val);
        }
    }
}

/** Checking the plan playlist scheduler if anything to run on time */
function planSchedulerCalculation(plan_scheduler, playlistItems, stop) {
    //Repeat the checking plan scheduler on each second
    if (stop == 1) {
        //startedPlaylist = 0;
        clearTimeout(planSchedulerCalculation1);
    } else {
        var planSchedulerAvailablity = 0;
        startedPlaylist = 1;
        //Getting internal tv clock or internet clock based on user selection in tv
        var da = ClockControl();
        //Checking all playlist object in the page
        $.each(plan_scheduler, function(key, value2) {
            var def = 1;
            var sch = $('.current-playlist-playlist-' + key).val();
            //Checking each playlist scheduler
            $.each(value2, function(key1, value1) {
                if (key1 != 'default' && sch != undefined) {
                    planSchedulerAvailablity = 1;
                    //var da = new Date(mDate);
                    var date = da.getTime();
                    var stdate = new Date(value1['start_date']).getTime();
                    var sodate = new Date(value1['stop_date']).getTime();
                    //comparing the date
                    //console.log(stdate+'---------'+date+'---------'+sodate);
                    if ((date > stdate) && (date < sodate)) {
                        //var da = cDate;
                        var hours = da.getHours();
                        var min = da.getMinutes();
                        var cu_time = (hours * 60) + min;
                        var stt = value1['start_time'].split(':');
                        var st_time = ((stt[0] * 60) + (stt[1] * 1));
                        var sto = value1['stop_time'].split(':');
                        var so_time = ((sto[0] * 60) + (sto[1] * 1) - 1);
                        //TIme compare
                        //console.log(st_time+'--time---'+cu_time+'---'+so_time);
                        if ((st_time <= cu_time) && (so_time >= cu_time)) {
                            //console.log('came');
                            //Checking week day
                            var day = da.getDay() + 1;
                            var found = 0;
                            for (var i = 0; i < value1['days'].length; i++) {
                                if (day == value1['days'][i]) {
                                    found = 1;
                                }
                            }
                            //Checking the weekday
                            if (found) {
                                def = 0;
                                if (sch != key1) {
                                    //Stopping the other playlist starting this playlist
                                    console.log(sch + '<---cancelling the previous scheduler & running --->' + key1);
                                    $('.current-playlist-playlist-' + key).val(key1);
                                    setPlaylistScheduler(playlistItems, key, key1, value1, 0);
                                } //End of not equal scheduler
                                return false;
                                //  break start;
                            }
                        } //End if time compare

                    } //End of date commpare

                } //End if of not default

            }); //End Each of particualer scheduler

            //Checking if no planning playlist playing then play default
            if (def) {
                //checking if not playlist playing default playlist should start
                var test = $('.current-playlist-playlist-' + key).val();
                if (test != 'default' && sch != undefined) {
                    console.log(test + '<---cancelling the previous scheduler & running --->' + 'default');
                    $('.current-playlist-playlist-' + key).val('default');
                    setPlaylistScheduler(playlistItems, key, 'default', value2['default'], 0);
                    //return false;
                }

            }

        }); //End Each scheduler
        //Checking if planscheduler not exist it will stop the checking plan scheduler
        if (!planSchedulerAvailablity) {
            planSchedulerCalculation("", "", 1);
        } else {
            planSchedulerCalculation1 = setTimeout(function() {
                planSchedulerCalculation(plan_scheduler, playlistItems, stop);
            }, 1000); //Time out
        }
    }

    //return false;

} //End of planSchedulerCalculation

//Starting the playlist by passing the plan_scheduler argument
//Call this function only when the page is showing
function startPlaylist(plan_scheduler, playlistItems) {
    //plan_scheduler = jQuery.parseJSON(plan_scheduler);
    var count = 2;
    $.each(plan_scheduler, function(key, value) {
        if ($("#object-" + key + " .playlist").length && $("#object-" + key)) {
            if ($(".current-playlist-playlist-" + key).length) {
                //Store the currently playing scheduler details
                $(".current-playlist-playlist-" + key).remove();
            }
            $('#object-' + key).append('<input type=\"hidden\" class=\"current-playlist-playlist-' + key + '\" name=\"current-playlist-playlist-' + key + '\" count=\"' + count + '\" value=\"blank\" />');
            //Start the scheduler with defaul playlist
            count++;
            //setPlaylistScheduler(playlistItems, key, 'default', value['default'], 0, 0);
        } else {
            $(".current-playlist-playlist-" + key).val("blank");
        }
    });
    //Started Checking the plan scheduler
    planSchedulerCalculation(plan_scheduler, playlistItems, 0);

}

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}


/** On page change it will call this function to update the details*/
//Stopping the previous playlist items and starting the current one
function startFunctionalityForCurrentPage(id) {

    //Stopping the previous running playlist functions
    if (startedPlaylist == 1) {
        setPlaylistScheduler("", "", "", "", "", 1);
        playPlaylist("", "", "", "", "", "", "", 1);
        planSchedulerCalculation("", "", 1);
    }


    //Stopping all the playlist video
    $('.playlist-object video').each(function() {
        //$(this).autoplay = false;
        //$(this).trigger('pause');
        if(isLatestMonitor){
            var vid = $(this).attr("id");
            var x = document.getElementById(vid);
            x.pause();
        }else{
            $(this).remove();
        }
    });

    //Appending all resource
     var data = $("."+id+" .resource").text();
     if(data != "{}"){
        constructCurrentPageResourcedetails(data, id)
      }//If condiiton to check resource contain any values


     //checking the global music can be played or not.
     $(".music-object audio").each(function(){
        var self = $(this);
        var master = $(this).parent().parent().parent().attr('master');
        if(master == "top" || master == 'bottom'){
            var music = MusicPlaylist();
            var check1 = music.check_precedence_for_music("global", id.split('-')[2]);
            var check2 = music.check_precedence_for_music("local", id.split('-')[2]);
            if(!check1 || !check2){
                gaudio.pause();
                gpaused = true;

            }else{
                gplay = self.attr('id');
            }
        }else{
            $(this).remove();
        }
    });

    //Checking the text object
    $("." + id + " .text-object .content-wrapper").each(function(){
        if($(this).hasClass("marquee")){
            var lang = $(".current-language").val();
            $("." + id + " .text-object .marquee").hide();
            $("." + id + " .text-object .marquee." + lang).show();
            $("." + id + " .text-object .marquee").each(function() {
                $(this).html($(this).html());
            });
        }else if($(this).hasClass("tickering")){
            //calling the tickering ffunction in current page
            applyTickeringFunction(id);
        }
    });


    //Start playlist videos in current page
    $("." + id + " .video-object").each(function() {
        checkingVideoObjectInCurrentPage($(this), id);
    });

    /**Appending the master object content to div if content not added
     */
     $("." + id + " .gadget-object.master .content-wrapper").each(function(){
         if($(this).html() == ""){
             //Appending the code from hidden field
             var cls = ".master-"+$(this).parent().attr("id");
             $(this).html($(cls).html());
             if($(this).find(".clock").length){
                 //alert('#' + $(this).attr("id"));
                    digital_clock_gadget_script('#' + $(this).attr("id"));
             }else if($(this).find(".weatherFive-gadget").length){
                 weatherFive_widget_gadget_script('#' + $(this).attr("id"));
             }
         }
     });

    //String the youtube video video in a page
    if($('.'+ id + ' .social-media-widget[search_type="youtube"]').length > 0) {
        $('.widget .social-media-widget[search_type="youtube"]').each(function(){
            $(this).children('div').remove();
        });
        socialMediaYoutube(id);
      }
     //Html widget
     if($('.page-active .gadget-object .html').length > 0) {
           changegadgethtmlobject();
      };

    //starting the PMS message functionality
    if( $('.'+ id + ' .pms-message-gadget').length >= 1){
        /* initializing the GuesTmessages array to be passed to the function setPmsStatus
        where it will set status as Read for new and unread messages */
        GuestMessages = [];
        //looping over each div element to check if any new message is avalaiable or not
        $('.menu-page-'+ pageid +' .pms-message-gadget .pms-message-inner-right').children('.pms-message-li-items').each(function(){
            var innerDivStatus = $(this).attr('status');
            if (innerDivStatus == 'UnRead' || innerDivStatus == 'New'){
                // pushing the value to the array if any found in the messages list
                GuestMessages.push({"ID": parseInt($(this).attr('message_id')), "Status": "Read"});
                // setPMSMessageStatus(id=$(this).attr('message_id'), status="Read")
            }
        });
        if (GuestMessages.length !== 0){
            setPMSMessageStatus(GuestMessages);
        }
    }

    if( $('.'+ id + ' .guest-bill-info').length >= 1){
        // requestPMSDetails("GuestBill");
    }
    //Starting the playlist
    if ($("." + id + " .playlist-object").length || $("." + id + " .music-object").length) {
        var nid = id.replace("menu-page-", "");
        if ($(".plan_scheduler_" + nid).length) {
            plan_scheduler = jQuery.parseJSON($(".plan_scheduler_" + nid).text());
            playlistItems = jQuery.parseJSON($(".playlistItems_" + nid).text());
            startPlaylist(plan_scheduler, playlistItems);
        }
    }
  //Storing the previous page id to user for next navigation
  previousPageId = pageid;
}

/**
 * Constructiing the resource for each page
 * @param {} id
 */

function constructCurrentPageResourcedetails(data, id){
    var media = jQuery.parseJSON(data);
    $.each(media, function(key, value){
        var count = 1;
        var obj_id = "object-" +key.split("-")[2];
        //Appending the images to page
        if(key.indexOf("image-object") > -1){
           var html = '<img src="'+mediaPath + value.image+'" style="'+value.style+'" alt="'+value.image+'"/>';
           $("."+id+" #"+obj_id).html(html);
        }else if((key.indexOf("video-object") > -1)){
            var style = ($("#content.column").hasClass("portrait") ) ? value.style_left : value.style;
            var html = '<div class="video-preview" style="display:none" css="'+style+'" src="'+mediaPath + value.video+'"></div>';
            $("."+id+" #"+obj_id+" .content-wrapper").html(html);
        }else if(key.indexOf("playlist-object") > -1){
         //  $.each(media, function(key1, value1){ no need for loop over media again as already one loop is running on top , this is making complex to check already appended div
            $.each(value, function(key1, value1){
             var html = "";
              if(value1.type == "image"){
                html = '<img class="playlist" id="'+value1.id+'" style="display:none;'+value1.style+'" alt="'+value1.file+'" src="'+mediaPath+value1.file+'"/>';
              }else if(value1.type == "audio"){
                  var master = $("."+id+" #"+obj_id).attr('master');
                  html = '<div class="playlist-audio playlist audio '+value1.id+'" css="display:none;'+value1.style+'" src="'+mediaPath+value1.file+'"></div>';
              }else{
                var style = ($("#content.column").hasClass("portrait") ) ? value1.style_left : value1.style;
                html = '<div class="playlist-video playlist video '+value1.id+'" css="display:none;'+style+'" src="'+mediaPath+value1.file+'"></div>';
              }
              //to play the global music we are appending audio file only to the first page to keep the track of it
              // check if the current page has global music and if its not first page then append the div to first page firstly
              // other wise it will throw audio not found Exception.
             if(value1.type == 'audio' && (master == "top" || master == "bottom") && audioAdded == 0 ){
                 var firstPage = $('.menu-item').first().attr('id');
                 $("."+firstPage+" #"+obj_id+" .content-wrapper").append(html);

             }else if(value1.type == 'audio' && (master == "top" || master == "bottom") && audioAdded == 1){
                 //skipping the appending part here for audio files since they are getting appended twice if only
                 // only one if and repective else is part is there
                 // hence need to write the continue part where nothing will happen
             }else{
                 if(count){
                     $("."+id+" #"+obj_id+" .content-wrapper").append(html);
                     html = '';
                 }
             }
            });
         //  });
        }
        //Empty the current page resource so no need to append repeatedly
        $("."+id+" .resource").text("{}");
      });
      //Setting audioadded to 1 for not repeatedly adding the content
      audioAdded = 1;

    //Appending the text object
     //var directory_path = window.location.pathname.replace(/[^\\\/]*$/, '');;
     var pid = $("."+id).attr("pageid");
     /*$.urlParurlParamam = function (name) {
         var results = new RegExp('[\?&]' + name + '=([^&#]*)')
                           .exec(window.location.search);

         return (results !== null) ? results[1] || 0 : false;
     }*/

    // var currenlang = $.urlParam('lang');
       if(!$("#parent-div").hasClass("preview")){
         $.each(text_content, function(keys, values){
             if(keys == pid){
                 var text = values;
                 $.each(text, function(key, value){
                    $.each(selectedLanguage, function(key1, value1){

                      //var def = "";
                      //var display = 'display:none';
                      var id1 = "text-object-" + key;
                      //f(value1 == defaultLanguage) { def = "default"; display = "display:block;"}
                      //if(currenlang != false && value1 == currenlang) { display = "display:block;";}
                      if(media[id1]){
                        if(media[id1].type == "plain"){
                         html = '<div id="content-'+key+'" class="content-wrapper '+value1+' text" direction="'+media[id1].direction+'" scrollamount="'+media[id1].speed+'">'+value[value1]+'</div>';
                        }else if(media[id1].scroll_type == "tickering"){
                         html = '<div id="content-'+key+'" class="content-wrapper '+value1+' tickering" direction="'+media[id1].direction+'" scrollamount="'+media[id1].speed+'">'+value[value1]+'</div>';
                        }else{
                         var speed = media[id1].speed * 5;
                         html = '<div id="content-'+key+'" class="content-wrapper '+value1+' marquee" direction="'+media[id1].direction+'" scrollamount="'+speed+'"><marquee style="height:100%;width:100%;" direction="'+media[id1].direction+'" scrollamount="'+media[id1].speed+'">'+value[value1]+'</marquee></div>';
                        }
                        $(".page-active #object-"+key).append(html);
                        if(media[id1].scroll_type == "tickering") {applyTickeringFunction(id);}
                      }//checking if text content is available
                    }); // Each loop of languages
                 });//Each loop of text widgets
                 //Displaying the current content
                 actlang = $('.current-language').val();
                 changeThePageContentBasedOnLanguage(actlang);
             }
         });
         /*if(currenlang && ($.inArray(currenlang, selectedLanguage) > 0 ) && currenlang != defaultLanguage){
             $('.page-active .text-widget .default').hide();
         } */
     //this will set the text font size for current page | again when page switched then there property will be set
    }//Checking if  : not preview
 } //ENd : constructiing the resource in page

 /**
  * Checking the video and broadcast object and playing the video
  * @param {*} id
  */
 function checkingVideoObjectInCurrentPage(video, id){
    var vid = video.attr("id");
    if ($("#"+vid+" .broadcast-object").length == 0) {
        if($("#"+vid+" video").length){
            var x1 = $("#"+vid+" video").attr("id");
            var x = document.getElementById(x1);
            x.currentTime = 0;
            x.play();
        }else{
            var src = $("#"+vid).find(".video-preview").attr("src");
            var css = $("#"+vid).find(".video-preview").attr("css");
            var html1 = '<video id="#video-'+vid+'" style="' + css + '"><source src="' + src + '" type="video/mp4"></video>';
            video.find(".content-wrapper").append(html1);
            $("." + id + " #" + vid + " video:visible").autoplay = true;
            $("." + id + " #" + vid + " video:visible").currentTime = 0;
            $("." + id + " #" + vid + " video:visible").load();
            videoTimeout = window.setTimeout(function() {
                $("." + id + " #" + vid + " video:visible").trigger('play');
            }, 100);
        }
    } else {
        $("#" + vid + " video").remove();
        $("#" + vid + " video").css({
            'display': 'none'
        });
    }
 }

 function changegadgethtmlobject() {
    var gadget_layer = '<div class="gadget-social-layer"></div>';
    //Replace gadget-obaject when active page
    $(".page-active .gadget-object .html").each(function(i, e) {
        var hiddensrc = $(this).find('input[type=hidden]').val();
       //  if( hiddensrc.indexOf("twitter") >= 0 || hiddensrc.indexOf("youtu") >= 0 ){
       // 	 $(this).addClass('focuslink');
       //  }
        $(this).find('.htmlsrc').html(hiddensrc);
        if( $(this).find('.gadget-social-layer').length == 0){
            $(gadget_layer).insertBefore(".htmlsrc");
        }
    });
 }
function applyTickeringFunction(id){
    if ($("." + id + " .text-object .tickering").length) {
        if (startedTextThickering == 1) {
            //Stops the previous tickering
            textWidgetMarqueeThickering("", "", "", "", "", "", 1);
        }
        $("." + id + " .text-object").each(function() {
            //Start the new tickering function
            if ($(this).find(".tickering").length) {
                var tid = $(this).attr("id");
                var lang = $(".current-language").val();
                var delay = $("#" + tid + " .tickering").attr("scrollamount") + "00";
                var direction = $(this).find(".tickering").attr("direction");
                startedTextThickering = 1;
                var count = 1;
                $('.tickering').find('li').addClass('thkwrap');
                $('.tickering').find('div').addClass('thkwrap');
                var element = "#" + tid + " ." + lang + ".tickering .thkwrap:nth-child(1)";
                if ($(element).length) {
                    textWidgetMarqueeThickering(tid, count, lang, 1, delay, direction, 0);
                }
            }
        });
    }
}//End of applyTickeringFunction function

//functionality to append iframe for youtube every time when user switch to any page
function socialMediaYoutube(id){

    if($("." + id + " .social-media-widget").length >= 1){
        $('.'+ id + ' .social-media-widget[search_type="youtube"]').each(function() {
            var social_id = $(this).parent().attr('id').split('-')[1];
            var search_value = $(this).attr('keyword');
            var youtubeid = fetchYoutubeId(search_value);
            if($(this).children('div').length == 0){
                var youtube = '<div id="player-'+social_id+'" style="width:100%;height:100%;position:relative;"></div>';
                $(this).append(youtube);
            }
            onYouTubePlayerAPIReady('player-'+social_id, youtubeid);
        });
    }
  }
//Tickering function for text objject
//It will depend thkwrap class to change the text everytime
function textWidgetMarqueeThickering(id, count, lang, pos, delay, direction, stop) {
    if (stop == 1) {
        //Stopd previous tickering
        startedTextThickering = 0;
        $.each(textWidgetMarqueeThickeringVar, function(key, value) {
            clearTimeout(textWidgetMarqueeThickeringVar[key]);
        });
    } else {
        lang = $('.current-language').val();
        thkclass = '.thkwrap';
        $("#" + id + " " + thkclass).hide();
        //Checking position number
        //SHowing the items based on the current language
        var element = "#" + id + " ." + lang + ".tickering " + thkclass + ":nth-child(" + pos + ")";
        $("#" + id + " .tickering").hide();
        $("#" + id + " ." + lang).show();
        var found = 1;
        //Checking if next value is contain the content
        while (found) {
            element = "#" + id + " ." + lang + ".tickering " + thkclass + ":nth-child(" + pos + ")";
            if ($(element).html() == "" && $(element).length) {
                pos = pos + 1;
            } else {
                found = 0;
            }
        }
        //Showing the value
        if ($(element).length) {
            $(element).show(500);
        } else {
            if ($("#" + id + " ." + lang + ".tickering div").length) {
                textWidgetMarqueeThickering(id, count, lang, 1, delay, direction, stop);
                return false;
            } else {
                return false;
            }
        }
        ///$("#"+id+" .tickering div:nth-child("+pos+")").show("slide", { direction: direction }, 1000);
        //It will wait based on user define values before changing the next item
        textWidgetMarqueeThickeringVar[id] = setTimeout(function() {
            pos = pos + 1;
            if ($(element).length) {
                textWidgetMarqueeThickering(id, count, lang, pos, delay, direction, stop);
            } else {
                textWidgetMarqueeThickering(id, count, lang, 1, delay, direction, stop);
            }
        }, delay);
    }
}

/**
 * Music playlist class here to implement all the related functionality for music playlist
 * at one place .
 */
function MusicPlaylist(opts){

    if(!(this instanceof MusicPlaylist)) {
        return new MusicPlaylist(opts);
    }
    var self = this;
    if(!opts){
        opts = {
            currentPlaylist: 0,
        };
    }

    this.currentPlaylist = opts.currentPlaylist;

    this.removeAllAudio  = function(rmaud){
        $('.playlist-audio audio:not(#'+gplay+')').each(function() {
            if(rmaud){
                var master = $(this).parent().parent().parent().attr('master');
                if(master == "0" || master == undefined){
                    $(this).remove();
                }
            }else{
                $(this).remove();
            }

        });
    }
    //use this function to add the instance of audio object in DOM and start playing it
    this.play_music_playlist = function(pl, pl_item, play){
        self.removeAllAudio(false);
        var src = $(pl + " ." + pl_item).attr("src");
        var css = $(pl + " ." + pl_item).attr("css");
        var html1 = '<audio preload="metadata" id="' + pl_item + '" style="' + css + '"><source src="' + src + '" type="audio/mpeg"><source src="' + src + '" type="audio/ogg"></audio>';
        if($(pl).parent().attr('master') == "top" || $(pl).parent().attr('master') == "bottom"){
            var firstPage = $('#pre-menu-container').next().attr('pageid');
            $('.menu-page-'+firstPage+" "+pl).find("." + pl_item).html(html1);
            gaudio = document.getElementById(pl_item);
        }else{
            $('.page-active '+pl).find("." + pl_item).append(html1);
        }
        if(play){
            $(pl + ' audio#' + pl_item).load();
            $(pl + ' audio#' + pl_item).trigger('play');
        }
    }
    //use this fn to check if the music playlist is allowed to play in the current page or not
    this.check_precedence_for_music = function(param, pageid){
        //checking the precedence the of the music which playlist should be played
        /**
         * there are two types of checking for the music playlist
         * 1. First we check if the music can be globally played or not
         * 2. second if the local music playlist is availabled then that will get the priority
         * 3. If any video or the objects are present than no music playlist is allowed to be played
         */
        var vidCount = $('.menu-page-'+pageid).find('.video-object, .video, iframe[src*="youtube.com"], .social-media-widget[social_feed = "youtube"]').length;
        //this is to check if the music for master is allowed to be played or not
        // if the above conditions meet then the localplalist is present and check2 has to be sent false
        //so the loop can enter in to the local music playlist section
        //at switch page all music objects has to be removed except the global once
        var localPlaylist = false;
        $('.menu-page-'+pageid).find('.music-object').each(function(){
            if($(this).attr('master') == undefined || $(this).attr('master') == "0"){
                localPlaylist = true;
            }
        });
        if(param == "global"){
            if(vidCount > 0) return false;
        }else if(param == "local"){
            // in this case means the master and local both may be present so the
            // priority will goto the local once so sending false
            //means gloabl is not allowed to be played
            if(localPlaylist == true)
            return false;
        }
        return true;

    }
    //on end of the audio this fn can trigger for next playlist item to play
    this.AudioOnEnd = function(aid, playlistItems, onid, sch, snid, pl_details, count, i, stop, currentPlaylist){
        //get the html object of the audio playing currently to set parameters
        aid.onended = function(){
            i++;
            var c_nid = $('.current-playlist-playlist-' + onid).val();
            if (c_nid == sch) {
                if(gplay){
                    i = parseInt(gplay.split('-')[2])+ 1;
                    gplay = null;
                }
                if(i != count){
                    playPlaylist(playlistItems, onid, sch, snid, pl_details, count, i, stop, currentPlaylist);
                }else{
                    self.playnextPlaylist(playlistItems, onid, sch, pl_details, stop, currentPlaylist, "audio");
                }
            } else {
                return false;
            }
        }
    }

    this.playnextPlaylist = function(playlistItems, onid, sch, pl_details, stop, currentPlaylist, type){
        if(type == 'audio'){
            self.removeAllAudio(true);
        }
        if(checkIfmb96Platform()) playCount = 0; 

        if (self.currentPlaylist == pl_details['plan'].length) {
            //Looping the playlists again in scheduler
            setPlaylistScheduler(playlistItems, onid, sch, pl_details, 0, stop);
        }else{
            self.currentPlaylist++;
            var c_nid = $('.current-playlist-playlist-' + onid).val();
            if (c_nid == sch) {
                setPlaylistScheduler(playlistItems, onid, sch, pl_details, self.currentPlaylist, stop);
            } else {
                return false;
            }
        }

    }
}

/**
 *Generic function which accepts the object ID to prevent it to go out of canvas, adjusting height, width of the object.
 */
function preventObjectOutsideCanvas(obj_id) {
    // obj_id = '#' + obj_id;
    //Setting the values of canvas dynamically
    if ($('.edit-page').hasClass('landscape')) {
        var canvas_width = 1280;
        var canvas_height = 720;
    } else {
        var canvas_width = 720;
        var canvas_height = 1280;
    }
    var min_width = canvas_width * 0.05;
    var min_height = canvas_height * 0.05;

    var width = parseInt($(obj_id).css('width').replace('px', ''));
    var height = parseInt($(obj_id).css('height').replace('px', ''));
    var left = parseInt($(obj_id).css('left').replace('px', ''));
    var top = parseInt($(obj_id).css('top').replace('px', ''));

    //Check width
    if (($(obj_id).outerWidth() + left) > canvas_width && width > parseInt(min_width)) {
        //Formula = (Current width - Total width + left - 1280)/parent_width *100 %
        var n_wid = parseInt(width - (parseInt($(obj_id).outerWidth()) + left - parseInt(canvas_width))) / canvas_width * 100;
        $(obj_id).css('width', n_wid + '%');
    } else if (($(obj_id).outerWidth() + left) > parseInt(canvas_width) && width <= parseInt(min_width)) {
        var n_left = parseInt(left - (parseInt($(obj_id).outerWidth()) + left - parseInt(canvas_width))) / canvas_width * 100;
        $(obj_id).css('left', n_left + '%');
    }

    //Check height
    if ($(obj_id).outerHeight() + top > parseInt(canvas_height) && height > parseInt(min_height)) {
        //Formula = (Current height - Total height + top - 780)/parent_height *100 %
        var n_hgt = parseInt(height - (parseInt($(obj_id).outerHeight()) + top - parseInt(canvas_height))) / canvas_height * 100;
        $(obj_id).css('height', n_hgt + '%');
    } else if ($(obj_id).outerHeight() + top > parseInt(canvas_height) && height <= parseInt(min_height)) {
        //If the height is less than 5% then decreasing the top value of the object
        var n_top = parseInt(top - (parseInt($(obj_id).outerHeight()) + top - parseInt(canvas_height))) / canvas_height * 100;
        $(obj_id).css('top', n_top + '%');
    }
}

function fetchYoutubeId(search_value){
    var youtubeid;
    var regPlaylist = /[?&]list=([^#\&\?]+)/;
    match = search_value.match(regPlaylist);
    if(match != null){
        youtubeid = match[1];
    }
    if (youtubeid == null){
        var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\/)|(\?v=|\&v=))([^#\&\?]*).*/;
        var match = search_value.match(regExp);
        if (match && match[8].length == 11){
            youtubeid  = match[8];
        }
    }
    return youtubeid;
}


function onYouTubePlayerAPIReady(social_id, youtubeid) {
    if($('.export-view').length){
        if(youtubeid != undefined && youtubeid.length > 11){
            player = new YT.Player(social_id, {
                playerVars : {
                    'controls':0,
                    'showinfo':0,
                    'listType': "playlist",
                    'list':youtubeid,
                    'autoplay': 1,
                    'loop':1,
                    'rel':0,
                },
                events : {
                    'onReady' : onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
        }else{
            try{
                player = new YT.Player(social_id, {
                    videoId: youtubeid,
                    playerVars : {
                        'controls':0,
                        'showinfo':0,
                        'playlist':youtubeid,
                        'autoplay': 1,
                        'loop' : 1,
                        'rel':0,
                    },
                    events : {
                        'onReady' : onPlayerReady,
                        'onStateChange': onPlayerStateChange
                    }
                });
            } catch (error){
                //console.log(error);
            }
        }
    }
}

function onPlayerReady(event){
    event.target.playVideo();
}

function onPlayerStateChange(event){
    if(event.data == YT.PlayerState.ENDED){
        event.target.playVideo();
    }
}

function stopVideo(event){
    event.target.stopVideo();
}

function ChangeVideoSourceOnPlayback(pl, pl_item, playlistItems, onid, sch, snid, pl_details, count, i, stop, currentPlaylist){
    //playing the video if video tag exist then it load and start playing
  
    var contentId = 'content-'+ onid;
    if ($(pl).find('.' + pl_item).hasClass('video')) {
        var src = $(pl + " ." + pl_item).attr("src");
        var css = $(pl + " ." + pl_item).attr("css");
        var videoTag = '<video id="' + contentId + '-video-item" style="' + css + ';background-color:#000;object-fit:fill;" src="' + src + '">';
        var htmlSeamlessCanvas = getCanvasHTML(css, onid);

        if (document.getElementById(contentId + "-video-item") == null ) { 
            $(pl).append(videoTag);
            // append the canvas html if not present in the playlist
            $(pl).append(htmlSeamlessCanvas);

            var videoElement = document.getElementById(contentId + "-video-item");
            //video object - show property since intial its hidden in DOM
            $("#" + videoElement.id).show();

            //getting the DOM element of the canvas
            var videoCanvas = document.getElementById('videoCanvas-' + onid);
            // draw the 2d canvas object via javaScript API
            var vidCtx = videoCanvas.getContext('2d');

            //set the poster attribute of the video Element
            // videoElement.setAttribute("poster", getPosterImage());

            //on error playing the video, start playing the next video object
            FireUpErrorEventForVideoPlayback(pl, pl_item, playlistItems, onid, sch, snid, pl_details, count, i, stop, currentPlaylist, videoElement);
            
            // on time update event trigger, show the canvas with frame and hide the video playing
            FireUpTimeUpdateEventOnVideoPlayabck(videoElement, videoCanvas, vidCtx);

            // on canplaythrough event trigger, play the video if PC can and hide the canvas
            FireUpCanPlayThroughEventOnVideoPlayback(videoElement);
            
            // on video end event play the next playlist item
            FireUpOnEndVideoEvent(pl_item, playlistItems, onid, sch, snid, pl_details, count, i, stop, currentPlaylist, videoElement, vidCtx)
            
        }else{
            //change the source of the video when playing next video
            $("#" + contentId + "-video-item").attr("src", src); 
        }


    }
}

function pauseVideoAfterPlaybackMonitors(onid){
    if(onid){
        var videoElement = document.getElementById(onid);
        videoElement.pause();
        videoElement.removeAttribute('src'); // empty source
        videoElement.load();
    }
}

/**
 * 
 * @param {*} css | contains the css style same as video object in the playlist with same width and height 
 * @returns html data for the canvas that can be appeneded to the playlist div
 */
function getCanvasHTML(css, onid){
    var canvas_height = 720;
    var canvas_width = 1280;
    var cssStyles = css.split(';');
    for (cssStyle in cssStyles){
        var indexValue = RegexToGetStyles('height', cssStyles[cssStyle], cssStyle);
        if (indexValue >= 0) canvas_height = fetchStyleValueFromString(cssStyles[indexValue], canvas_height);
        var indexValue = RegexToGetStyles('width', cssStyles[cssStyle], cssStyle);
        if (indexValue >= 0) canvas_width = fetchStyleValueFromString(cssStyles[indexValue], canvas_width);
    }
    return '<canvas id="videoCanvas-'+ onid +'"  width="'+ canvas_width+'" height="'+ canvas_height+'" style="'+ css+';display:none;background:#000;object-fit:fill;"></canvas>';

}

function RegexToGetStyles(param, cssStyle ,index){
    return (cssStyle.indexOf(param) >= 0) ? index : -1;
}

function fetchStyleValueFromString(param, defaultStyle){
    var matches = param.match(/(\d+)/);
    return (matches) ? matches[0] : defaultStyle;
}

/**
 * 
 * @returns png image of the poster attribute for the video
 */
function getPosterImage(){
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA3NCSVQICAjb4U/gAAAABlBMVEUAAAD///+l2Z/dAAAACXBIWXMAAAsSAAALEgHS3X78AAAAFnRFWHRDcmVhdGlvbiBUaW1lADA5LzAzLzIx3MFfSQAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAAKSURBVAiZY2AAAAACAAH0cWSmAAAAAElFTkSuQmCC";

}
/**
 * 
 * @param {*} pl - playlist information
 * @param {*} pl_item - playlist item information
 * @param {*} playlistItems - details of each playlist item
 * @param {*} onid - object id 
 * @param {*} sch - schdedular details
 * @param {*} snid - schedular nid
 * @param {*} pl_details - playing playlist details
 * @param {*} count - count of the items
 * @param {*} i - current counter holding variable
 * @param {*} stop - wheather to stop the playlist
 * @param {*} currentPlaylist - current playing playlist object
 * @param {*} videoElement - DOM element of the video object currently playing
 */
function FireUpOnEndVideoEvent(pl_item, playlistItems, onid, sch, snid, pl_details, count, i, stop, currentPlaylist, videoElement, vidCtx){
    videoElement.addEventListener("ended", function(){
            videoElement.pause(); 
            setTimeout(function(){
                //draw current video frame to videoCanvas element
                if(pl_item.indexOf('video') >= -1){
                    vidCtx.drawImage(videoElement, 0, 0, $('#' + videoElement.id).outerWidth(), $('#' + videoElement.id).outerHeight());
                    $("#videoCanvas-" + onid).show();
                    $("#" + videoElement.id).hide();
                }
                playCount++;
                var c_nid = $('.current-playlist-playlist-' + onid).val();
                if (c_nid == sch) {
                    if(playCount != count){
                        playPlaylist(playlistItems, onid, sch, snid, pl_details, count, playCount, stop, currentPlaylist);
                    }else{
                        var music = MusicPlaylist({
                            currentPlaylist:currentPlaylist
                        });
                        music.playnextPlaylist(playlistItems, onid, sch, pl_details, stop, currentPlaylist, 'video');
                    }
            
                } else {
                    return false;
                }
            },100); //wait 100ms to stop stable to draw last frame pictrue
    });
}

/**
 * 
 * @param {*} pl - playlist information
 * @param {*} pl_item - playlist item information
 * @param {*} playlistItems - details of each playlist item
 * @param {*} onid - object id 
 * @param {*} sch - schdedular details
 * @param {*} snid - schedular nid
 * @param {*} pl_details - playing playlist details
 * @param {*} count - count of the items
 * @param {*} i - current counter holding variable
 * @param {*} stop - wheather to stop the playlist
 * @param {*} currentPlaylist - current playing playlist object
 * @param {*} videoElement - DOM element of the video object currently playing
 */
function playNextPlaylistItem(playlistItems, onid, sch, snid, pl_details, count, i, stop, currentPlaylist){
    playCount++;
    var c_nid = $('.current-playlist-playlist-' + onid).val();
    if (c_nid == sch) {
        if(playCount != count){
            playPlaylist(playlistItems, onid, sch, snid, pl_details, count, playCount, stop, currentPlaylist);
        }else{
            var music = MusicPlaylist({
                currentPlaylist:currentPlaylist
            });
            music.playnextPlaylist(playlistItems, onid, sch, pl_details, stop, currentPlaylist, 'video');
        }

    } else {
        return false;
    }
}

function FireUpErrorEventForVideoPlayback(pl, pl_item, playlistItems, onid, sch, snid, pl_details, count, i, stop, currentPlaylist, videoElement){
    
    videoElement.addEventListener("error", function(e) {

        playNextPlaylistItem(playlistItems, onid, sch, snid, pl_details, count, i, stop, currentPlaylist);

    });
}

function FireUpTimeUpdateEventOnVideoPlayabck(videoElement, videoCanvas, vidCtx){
    //Need to wait until the first frame is showing to skip background flash
    videoElement.addEventListener("timeupdate", function() {
        if(videoElement.currentTime > 0 && videoElement.currentTime < 0.6) {
            $("#"+videoElement.id).show();
            $('#' + videoCanvas.id).hide();
            vidCtx.clearRect(0, 0, $('#' + videoCanvas.id).outerWidth(), $('#' + videoCanvas.id).outerHeight());
        }
    });
}

//to play videos in mb96 platforms
function FireUpCanPlayThroughEventOnVideoPlayback(videoElement){
    var isLetPCcanAutoPlay = false;
    videoElement.addEventListener("canplaythrough", function() {
        if(isLetPCcanAutoPlay) { videoElement.muted = true; }
        if(videoElement.paused) {
            videoElement.play();
        }
    });
}
/**
 * 
 * @returns boolean value based on current platform if its mb96 platform / need to check the function validity
 */
function checkIfmb96Platform(){
    return true;
    // return (navigator.userAgent.indexOf("BDL3550Q") > -1
    // || navigator.userAgent.indexOf("4550D") > -1
    // || navigator.userAgent.indexOf("3651T") > -1
    // || navigator.userAgent.indexOf("3452T") > -1
    // || navigator.userAgent.indexOf("CRD50") > -1
    // || navigator.userAgent.indexOf("4052E") > -1
    // || navigator.userAgent.indexOf("02S") > -1
    // ) ? true : false;
}