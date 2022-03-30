var nextPrev = [];
var txt_color = "";
var pageid = "";
var dynamicObject = {};
var currentPageId = 0;
var previousPageId = 0;
var fullmodeTimeout = "";
var isAudioMute = "";
var audioVolume = "";
var isPageLoaded = "";
var pageTimer;
var os = "";
var browser = "";
var debugEnable = false;
var basepath = "";
var isLatestMonitor = true;
var isOldVideoLoad = false;
var str = navigator.userAgent;
if (str.indexOf("SmartTvA") > -1 && str.indexOf("Opera/9.80") > -1) {
  isOldVideoLoad = true;
}

function myTestFunction(sStatus){
	isLatestMonitor = sStatus;
	Debug("Calling the function from android app:  myTestFunction :" + sStatus);
}

/**
 * Startup function
 */

getSystemInfo = function() {
    var userAgent = window.navigator.userAgent;
    var browsers = { chrome: /chrome/i, safari: /safari/i, firefox: /firefox/i, ie: /internet explorer/i };
    for (var key in browsers) {
        if (browsers[key].test(userAgent)) {
            browser = key;
            break;
        }
    };
    if (userAgent.match(/Android/i)) {
        os = 'android';
    } else if (userAgent.match(/iPhone | iPad | iPod/i)) {
        os = 'ios';
    } else if (userAgent.match(/Windows/i)) {
        os = 'windows';
    } else {
        os = 'linux';
    };
    console.log('os ' + os);
};

function RootInit() {
    basepath = ($('.preview').length > 0) ? base_url + "/" : '';
    pfmode = "";
    isPageLoaded = "";
    isOldPlatform = true;
    reSourceRequest = false;

    //Receive or call back from TV
    try {
        webixpObject.WebIXPOnReceive = callbackDispatcher;
    } catch (e) {
        //
    };
    $(".playlist-video a, .video-playback-widget a").remove();
    getSystemInfo();
    setTVModel();
  PageInit();
}; //End RootInit function


function PageInit(){

    //calling the JAPIT Commands to start the page working
    channelInit();

    objectActionKey.isKeyAction = "";
    objectActionKey.isNumericEntryEnable = $('.numerickey_enable').val();
    //objectActionKey.isNumericEntryEnable = 0;
    Debug("NumericEntry Enabled :  " + $('.numerickey_enable').val());

    menuItemHeight = ($(".menu-item-height-hidden").val()) == 0 ? "100%" : $(".menu-item-height-hidden").val();

    if ($('#digitalvideo').length == 0) {
        $('<div width=\"0\" height=\"0\"></div>').attr('id', 'digitalvideo').appendTo('#content');
    };

    $("body").append('<div id="debug" style="z-index:9999;"></div>');
    if (debugEnable == true) {
        $('#debug').show();
    } else {
        $('#debug').hide();
    };

    var listlang = getParameterByName('lang').trim();
    if (listlang) {
        menuTranslation(listlang);
        $('.current-language').val(listlang);
        changeThePageContentBasedOnLanguage(listlang);
    }
    //End


    dynamicObject = {
        "menu-object": menuitem,
        "language-object": languageitem,
        "channels-object": channelsitem
    };

    $('.preview-loading').hide();

    get_menu_status();
    $(".page-website-view #main").addClass("normal-resolution");
    try{
        if(window.matchMedia("(orientation: landscape)").matches && $('.normal-resolution').find('.portrait').length){
            $('.normal-resolution').css({
                "top": 0,
                "left":0
            });
        }
    }catch(e){
        Debug('error : ' + e)
    }
    $('.language-selection li span').css('line-height', '0px');
    // if($('.select_lang_box').length){
    //     var rotatecss = ($('.rotate-left.export-view').length) ? "rotate(-90deg)" : ($('.rotate-right.export-view').length ? "rotate(90deg)" : "rotate(0deg)");
    //     $(".select_lang_box").css({"transform":rotatecss, "top":"280px"});
    // }
    //Remove all href
    $("a").removeAttr("href");
    $(".object-wrapper").removeAttr("href");

    if ($("#parent-div .page-display").length == 1) {
        $('.pre-menu-container li.deactive').remove();
    }

    txt_color = $('.pre-menu-container li a').css('color'); //Get menu text color

    //Set default language highlights for all pages in listview
    $('.lang.listview .language'+defaultLanguage).addClass('listnavi');
    //End default listview highlights

    if ($('.pre-menu-container li.meactive .sub-menu li.mLink').length > 0) {
        $('.pre-menu-container li.meactive .sub-page-arrow').show();
    }

    $('#vidObject').css({
        "width": '100%'
    });
    $('#vidObject').css({
        "height": '100%'
    });

    $(".page-active ul.channels-menu").hide();
    $('.page-active ul.channels-menu').html("");

    if ($('#dummybroadcast').length == 0) {
        $('<div id="dummybroadcast"></div>').appendTo('#parent-div');
        $('#dummybroadcast').css("position", "absolute");
        $('#dummybroadcast').css("width", "10px");
        //$('#dummybroadcast').css("height", "100px");
        $('#dummybroadcast').css('top', $('#parent-div').height() - 1 + "px");
        $('#dummybroadcast').css("left", $('#parent-div').width() - 1 + "px");
        $('#dummybroadcast').css({ "z-index": 9998 });
    };

    if ($('#digitalentry').length == 0) {
        $('<div id="digitalentry"></div>').appendTo('#parent-div');
        $('#digitalentry').css("fontSize", "30px");
        $('#digitalentry').css("position", "absolute");
        $('#digitalentry').css("width", "100px");
        $('#digitalentry').css("left", ($('#parent-div').width() - ($('#digitalentry').width() + 10)) + "px");
        $('#digitalentry').css('top', '10px');
        $('#digitalentry').css('display', 'none');
        $('#digitalentry').css({
            "z-index": 9999
        });
        $('#digitalentry').css('text-align', 'right');
    }

    /**
     * Touch function
     * @see : is_touch_device() it's return wether touch or not
     */
    if (is_touch_device() == true || $('#parent-div').hasClass('preview')) {

        //Menu and Submenu click events
        $('.pre-menu-container li').on("click", function(event) {
            var eventid = $(event.target).attr('pval');
            if (eventid != undefined) {
                PageSwitch(eventid, 'menu');
                event.preventDefault();
                event.stopPropagation();
            }
        });

        //if click subpage arrow it's show all subpage
        $('.sub-page-arrow').on("click", function() {
            var activeLink = $(".pre-menu-container li a.active");
            if (activeLink.parent().hasClass('menu-item')) {
                if (activeLink.next().find('li').length > 0) {
                    if ($('.page-active .widget').hasClass('active')) {
                        return;
                    } else {
                        activeLink.next().show();
                        activeLink.removeClass("active");
                        $('.sub-menu-item').removeClass('arrow');
                        activeLink.next().find('li:first-child a.link.sub-menu-item').addClass('active');
                        $('.active').parent().addClass('arrow');
                        set_sub_menu_bg(txt_color);
                    }
                }
            } else {
                if (activeLink.parent().hasClass('sub-menu-item')) {
                    activeLink.removeClass("active");
                    activeLink.parent().next().find('.link.sub-menu-item').addClass('active');
                    $('.sub-menu-item').removeClass('arrow');
                    $('.sub-menu-item .active').parent().addClass('arrow');
                    set_sub_menu_bg(txt_color);
                }
            }
        });

        //On language selection and Widget Object click action
      /* $(".language-item").on("click", function(event) {
            var target = $(event.target);
            //Listview of lanaguage object
            if (target.parent().parent().is(".language")) {
                var langname = target.parent().parent().attr('langname');
                $('.page-active .language').removeClass('listnavi');
                $('.lang.listview').find("[langname=" + langname + "]").addClass('listnavi');
                PageDefaultFocus("widget");
                languageitem.Focus();
                changelanguages();
            }else{
                //Checking for popup
                widgetClick("click", $(this), 'language');
                PageDefaultFocus("widget");
                languageitem.Focus();
                changelanguages();
                event.preventDefault();
                event.stopPropagation();
            }
        }); *///ENd : of language click

          //On language selection click action
        $(".object-wrapper").on("click", function(event) {
            var target = $(event.target);
            // checking length of listview lanaguage popup
            if ($(this).find('.content-wrapper.listview').length == 1) {
                if (target.parent().parent().is(".language")) {  //Listview of lanaguage object
                    var langname = target.parent().parent().attr('langname'); //Get language name in listview
                    $('.page-active .language').removeClass('listnavi'); //Remove language active class in popup view
                    $('.lang.listview').find("[langname=" + langname + "]").addClass('listnavi'); //set active class for language in popup view
                    PageDefaultFocus("widget");  //Set default highlights
                    languageitem.Focus();
                    changelanguages();
                }
            } //END of length of listview popup

            // checking length of lanaguage popup
            if ($(this).find('.content-wrapper.popup').length == 1) {
                if (target.parent().parent().is(".language")){ //popup of lanaguage object
                    PageDefaultFocus("widget");  // Set default highlights
                    languageitem.Focus();
                    changelanguages();
                }
            } //End of length language popup

            // if popup is language popup
            if ($(this).hasClass('link')) {
                //checking if language popup is language or widgetobject
                var objName = ($(this).parent().parent().is('.popup') || $(this).is('.popup')) ? 'language' : 'widgetobj';
                widgetClick("click", $(this), objName);
                if (objName == 'widgetobj') {
                    PageDefaultFocus("widget");
                    languageitem.Focus();
                    changelanguages();
                }
                event.preventDefault();
                event.stopPropagation();
            } //End language popup
        }); //ENd : of language click



        $('.sel_lang').on("click", function() {
             //checking the length of select langauage
            if ($('.page-active .select_lang_box:visible').length >= 0) {
                $('.sel_lang').removeClass('langactive'); //Remove language active class in popup view
                $(this).addClass('langactive'); //set active class for language in popup view
                changelanguages();
            }
        }); //End click action
    } //END touch function

    /*if($(".current-page-scheduler").val() != 'default') {
    }*/
    /**
     * XML Page [Android Tv]
     * when click thumbnail of image it's redirect to selected page
     * @param : pageid
     * @see   : getParameterByName() return pageid from url
     */
    if (!$("body").hasClass("page-website-edit")) {
        isPageLoaded = "";
        var urlid = getParameterByName('page').trim();
        if (urlid != "" && urlid != undefined) {
            //pageid = urlid;
            PageSwitch(urlid, 'menu', 'init');
        } else {
            if ( ($(".current-page-scheduler").val() == 'default') || ($(".current-page-scheduler").val() === undefined) ) {
                pageid = $('#pre-menu-container li.mLink').attr('pval'); //Get pageid of first menu
                PageSwitch(pageid, 'menu', 'init'); //Select page redirection
            }
        }
    } //End XML Page

}; //End RootInit function


/**
 * Remote click and touch
 * @param : string mCondition
 *   pass argument touch or Remote ok
 * @param : sting  mObject
 *   selected object name
 * @param : string mName
 *   argument menu or widget object
 * Get active object
 * Redirect to selected page
 */

function widgetClick(mCondition, mObject, mName) {

    $('.arrow').attr('style', '');

    if (mCondition == '' || mCondition == undefined) {
        mCondition = 'click';
    }

    switch (mName) {
        case 'widgetobj':
            $('.link').removeClass('active');
            $(mObject).addClass('active');
            break;
        case 'child-menu':
            $('li').removeClass('arrow');
            $('.link').removeClass('active');
            $(mObject).addClass('arrow');
            $(mObject).find('.link').addClass('active');
            break;
        case 'language':
            //removed the focus
            $('.link').removeClass('active');
            $('.page-active .popup').find('.language-object').addClass('listnavi');
            break;
    }

    pageid = $('.page-active .widget').attr('id'); // Get page id
    var widActive = $('.page-active .widget').find('.object-wrapper.link').hasClass('active'); // Checking object wether active class add or not

    //Get widget action
    if ($('.page-active .widget .link.object-wrapper').hasClass('active') && $('.page-active .link.language-object.active').attr('aval') != '#') {

        var actionname = $('.page-active .widget .object-wrapper.active').attr('aval'); //Get active object action value
        var sp = (actionname == null) ? '' : actionname.split('|');

        Debug(mCondition + " > " + sp);

        switch (sp[1]) {

            case 'apk': // Launch apk
                /*if (TVPlatform == "android"){
                  unGrabVirtualKeyForward();
                }*/
                setTimeout(function() {
                    switchToApplication(sp[0].toString(), 'Activate', sp[1]);
                }, 10);
                break;

            case 'url': // External link page (like google,yahoo)
                if($(".web-prev-page").length){
                   var popup = Alert_object_popup_html();
                   $(".externallink").remove();
                   $('.widget').append(popup);
                   //click confirm redirect extrnal link page
                   $('.externallink #modal-confirm').click(function() {
                      window.location.href = sp[0];
                   });
                   // click cancel button close popup
                   $('.externallink #modal-cancel').click(function() {
                     $('.modals-content').hide();
                   });
                   return;
                }
                window.location.href = sp[0];
                break;

            case 'pages': // Get internal page id
                var chkparent = sp[0].split('-');
                if($('.menu-page-'+chkparent[1]).length > 0){
                    nextPrev.push($('.page-active').attr('pageid'));
                    PageSwitch(chkparent[1], 'menu');
                }
                break;

            case 'channels': //channels previews and next
                if (sp[0] == 'Next') {
                    requestNext();
                } else {
                    requestBack();
                }
                break;

            case 'switch-channels': //switch opertaion it's playing selected channels
                var chnum = parseInt(sp[0]);
                for (var i = 0; i < channelList.length; i++) {
                    if (channelList[i].ChannelNo == chnum) {
                        if (sp[2] == 'fmode') {
                            // leaveSmartInfo();
                           // if(TVPlatform != "2K16"){activateTvChannels();}
                            objectActionKey.isKeyAction = "tuningchannelAndExit";
                         }
                        switchToChannel(chnum);
                        showCurrentChannelSet(i);
                        break;
                    }
                }
                break;

            case 'switch-option': // switch application Miracast, Directshare, Skype, SmartTv
                if ((sp[0] == 'Miracast' || sp[0] == 'Directshare') && (isOldPlatform == true)) {
                    requestApplication(sp[0]);
                } else {
                    switchToApplication(sp[0].toString());
                };
                break;

            case 'source-option': //switch source MainTuner, HDMI, VGA
                pfmode = sp[2];
                if (sp[0] == "MainTuner") {
                    selectChannelFromTV(channelList[currentIndex].ChannelNo);
                } else {
                    switchToSource(sp[0].toString());
                };
                clearTimeout(fullmodeTimeout);
                if (pfmode == 'fmode') {
                    var mTime = 1000 * 10;
                    if ((sp[0].toString() == tunedSource) || (sp[0].toString() == "MainTuner")) {
                        mTime = 100;
                    };
                    fullmodeTimeout = window.setTimeout(function() {
                        pfmode = "";
                        clearTimeout(fullmodeTimeout);
                        if(sp[0].toString() == "MainTuner" ){
                            activateTvChannels();
                        }else{
                            leaveSmartInfo();
                        }

                    }, mTime);
                };
                break;

            case "youtube-actions":
                if(!player) return;
                if(sp[0] == "Previous"){
                    player.previousVideo();
                }else{
                    player.nextVideo();
                }
                break;
            case "wixp" :
                    var wixp_command = $('.page-active .widget .object-wrapper.active').attr('wixpcommand'); //Get active object action value
                    var wixp_object = JSON.parse(JSON.parse(decodeURIComponent(wixp_command)));
                    send2Queue(wixp_object);
                    break;

        } //END OF SWITCH

    } else {
        //
    }

} //END widgetClick

/**
 * Get page id from url
 * @param : url
 * @return : page id
 */
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
} //End


/**
 * Checking for touch device
 * @return : device touch or not
 */
function is_touch_device() {
    return (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
} //End touch device

/** Text object
 *  marquee and tickering
 *  @param : lang selected language name
 *  @param : id text object id
 */
function change_textobj_marquee_prop(lang, id) {
    $(".export-view .text-object .marquee").each(function() {
        $(this).html($(this).html());
    });
    if ($("#" + id + " .text-object .tickering").length) {
        textWidgetMarqueeThickering("", "", "", "", "", "", 1);
        $(".export-view #" + id + " .text-object").each(function() {
            if ($(this).find(".tickering").length) {
                var tid = $(this).attr("id");
                var delay = $("#" + tid + " .tickering:first").attr("scrollamount") + "00";
                var direction = $(this).find(".tickering").attr("direction");
                startedTextThickering = 1;
                var count = 1;
                if ($("#" + tid + " ." + lang + ".tickering div").length) {
                    textWidgetMarqueeThickering(tid, count, lang, 1, delay, direction, 0);
                }
            }
        });
    }
} //End marquee and thickering

/**
 * @info  : Set Active menu and page hightlight
 * @param : pageid active page id
 * @param : focusOn whether Focus to menu or object
 */
function PageSwitch(pageid, focusOn, navigationFrom) {
  /*
  To remove the video object while navigating in the menu
  To remove the video object from the playlist while navigating in the menu
  */
  $(".playlist-object video, .video-object video").each(function(){
      $(".playlist-video").hide();
    var vid = $(this).attr("id");
    if(checkIfmb96Platform()){
        pauseVideoAfterPlaybackMonitors(vid);
    }else if(isLatestMonitor){
        var x = document.getElementById(vid);
        x.pause();
    }else{
        $(this).remove();
    }
  });


   //removing the previous dummy video
    $('#digitalvideo').html('');
    //Removing the previous broadcast object
    $('.widget .video-object .broadcast-object').each(function() {
        try {
            $(this).find('object').stop();
            Debug('---------Stopping the broad cast object from playing-----------');
          } catch (e) {
            //
          };
        $(this).find('object').remove();
    });

    //Stoping the previous page videos
    $(".video-object video").each(function() {
        //$(this).autoplay = false;
        //$(this).trigger('pause');
        var vid = $(this).attr("id");
        if(checkIfmb96Platform()){
            pauseVideoAfterPlaybackMonitors(vid);
        }else if(isLatestMonitor){
         var x = document.getElementById(vid);
         x.pause();
        }else{
            $(this).remove();
        }
    });

    $('.widget .social-media-widget[search_type="youtube"]').each(function(){
        $(this).find('iframe').remove();
    })


    $('.arrow').attr('style', '');
    Debug(" previousPageId > " + previousPageId + " pageid > " + pageid);

    //previousPageId equal to selected pageid page will not reload
    if (pageid == undefined) {
        pageid = $('.page-active').attr('pageid');
        $('.sub-menu').hide();
    };

    var parentid = $('#menu-page-' + pageid).attr('parentpage'); //Get menu parent page id

    if (parentid == "" || parentid == undefined) {
        parentid = pageid;
    };

    //get meactive background color
    if($('#menu-page-' + pageid).length){
      var bgcolor = $('.pre-menu-container li.parent:not(.meactive)').css('background-color');
      var acbgcolor = $('.pre-menu-container li.meactive').css('background-color');
      var color = $('.pre-menu-container li.parent:not(.meactive) a').css('color');
      var accolor = $('.pre-menu-container li.meactive a').css('color');
      var fontstyle = $('.pre-menu-container').css("font-family");
      $('.pre-menu-container').css({ "font-family": fontstyle });
      //Remove all active class from menu and objects
      $('.link.object-wrapper').removeClass('active');
      $('.sub-page-arrow').hide();
      $('.sub-menu').hide();
      $('.pre-menu-container li').removeClass('meactive');
      $('.pre-menu-container li').find('a.link').removeClass('active');
      $('.sub-menu-item').removeClass('active');
      $('.child-menu').removeClass('arrow');

      //set hightlight and add active class for selected menu background
      $('.pre-menu-container li').css('background-color', bgcolor);
      $('.pre-menu-container li a').css('color', color);
      $('.pre-menu-container li#menu-page-' + parentid).css('background-color', acbgcolor);
      $('.pre-menu-container li#menu-page-' + parentid + ' a').css('color', accolor);

      $('.pre-menu-container li#menu-page-' + parentid).find('a.link.parent').addClass('active');
      $('.pre-menu-container li#menu-page-' + parentid).addClass('meactive');

      //if subpage is their show subpage arrow
      if ($('.pre-menu-container li.meactive .sub-menu li.mLink').length > 0) {
          $('.pre-menu-container li.meactive .sub-page-arrow').show();
      }
    }

    var mTime = 5;
    if (navigationFrom == 'menu') {
        //loading time for content in the page.
        mTime = 500;
        if (isPageLoaded != "started") {
        //    mTime = 30;
        };
    };

    clearTimeout(pageTimer);

    pageTimer = window.setTimeout(function() {

        clearTimeout(pageTimer);
        clearTimeout(setCallTimeout);
        clearTimeout(videoTimeout);

        if (debugEnable == true) {
            Debug("", true);
        };

        pfmode = "";
        IsVideoPresent = "";
        objectActionKey.isKeyAction = "";
        isPageLoaded = "started";

        $('#dummybroadcast').html('');

        //Set page-active class for selected page
        //if($('.pre-menu-container li.mLink').length > 0) { $('#parent-div .page-display').removeClass('page-active'); }
        $('#parent-div .page-display').removeClass('page-active');
        $('.menu-page-' + pageid).addClass('page-active');

        //hide language option without text-area
        var langcount = $('.langcount').val();
        var chkxtobj = $('.page-active .widget .object-wrapper').hasClass('text-object');

        if (chkxtobj == false || (langcount == 1 || langcount == 0)) {
            $('.page-active .widget .object-wrapper.lang-option').remove();
        }

        //Listview : highlights on default language
        if ($('.page-active .listview').length == 1) {
            var activelang = $('.current-language').val();
            $('.lang.listview').find('.language').removeClass('listnavi');
            $('.lang.listview').find("[langname=" + activelang + "]").addClass('listnavi');
        };

        /*if($('.page-active .text-object').length > 0) {
            $(".page-active .text-object").each(function(i, e) {
                if($(this).attr("wixpcommand")){
                    var wixp_command = $(this).attr("wixpcommand");
                    var wixp_object = JSON.parse(decodeURIComponent(wixp_command));
                    requestWixpCommand(wixp_object);
                }
            })
        }*/
        //Remove all html gadget
        $(".gadget-object.html").each(function(i, e) {
            $(this).find('.htmlsrc').html('');
        });
        broadcastVideoStart(pageid, previousPageId);

        if($('.page-active .gadget-object').length > 0) {
            changegadgethtmlobject();
          };
        startFunctionalityForCurrentPage('menu-page-' + pageid);
        //below code is to append any guestdetails if any present
        if($('.'+'menu-page-' + pageid+' .GuestDetails').length > 0){
            if(!GuestName){
                requestPMSDetails("GuestDetails");
            }else{
                $('.'+'menu-page-' + pageid+' .GuestDetails').html(GuestName);
            }

        }
        if($('.'+'menu-page-' + pageid+' .RoomID').length > 0){
            $('.'+'menu-page-' + pageid+' .RoomID').html(RoomID);
        }
        PageDefaultFocus(focusOn);

        if ($('.page-active .widget .object-wrapper.channels-object').length == 1) {
            channelsBuild();
        };

        $('*').removeAttr('tabindex');
        //Add tabindex for all action object and gedgetobject

        $(".pre-menu-container, .page-active .focuslink, .page-active .twitter-timeline, .page-active .link").each(function(i) { $(this).attr('tabindex', i + 1); });
        $('.pre-menu-container').focus();

        window.setTimeout(function() {
            isPageLoaded = "finish";
            //to remove the loading symbol from the page after loading the contents.
            // $("body").removeClass("loading");
        }, 500);

    }, mTime);

} //END PageSwitch

/*
 * Finding Next Object in a page
 * @param : Direction of Finding
 * @info : Set highlights for active object
 */
function FindPageWidgetObject(direction) {

    objectActionKey.isKeyAction == "";
    var widActive = $('.page-active .widget').find('.object-wrapper.link').hasClass('active');

    Debug("direction > " + direction + " :: widActive > " + widActive);

    if (widActive == false) {
        for (var key in dynamicObject) {
            if (dynamicObject.hasOwnProperty(key)) {
                dynamicObject[key].RemoveFocus();
            }
        }

        PageDefaultFocus('widget');

    } else {

        var currattr = $('.page-active .object-wrapper.link.active');
        var directionId = currattr.attr(direction);
        if (directionId != undefined && directionId != currattr.attr('obid') && $('#object-' + directionId).attr('aval') != "nolink") {
            $('.link.object-wrapper').removeClass('active');
            $('.page-active #object-' + directionId).addClass('active');
            LanguagepopupHighlight();
            RemoveFocusOnDynamicObject(currattr.attr("obid"));
            FocusOnDynamicObject(directionId);

        } else {
            var dname = 'top';
            var mLeft = $('.pre-menu-container').offset().left;
            var mTop = $('.pre-menu-container').offset().top;
            var percentLeft = ((mLeft / $(this).width()) * 100);
            var percentTop = ((mTop / $(this).height()) * 100);

            if ($('.menu_type').val() == "1") {
                dname = (percentTop < 50) ? "top" : "bottom";
            } else if ($('.menu_type').val() == "2") {
                dname = (direction == "top") ? "top" : (percentLeft < 50) ? "left" : "right";
            }

            if (direction == dname && menuIsEnable == 1 && $('.medeactive.mLink').length > 0) {
                var currattr = $('.page-active .object-wrapper.link.active');
                RemoveFocusOnDynamicObject(currattr.attr("obid"));

                $('.link.object-wrapper').removeClass("active");
                $('.pre-menu-container .meactive').find('a.link.parent').addClass('active');
                if ($(".pre-menu-container li").length > 1) {
                    dynamicObject["menu-object"].Focus();
                    $(".pre-menu-container").addClass('menuactive');
                }
            }

        } //END IF
    } //END IF
}; //END FindPageWidgetObject

/**
 * Default focus
 * @param : focusOn of Finding
 * @info  : Set default highlights to menu
 */

function PageDefaultFocus(focusOn) {
    $('.pre-menu-container ').removeClass('menuactive');
    if (focusOn.toLowerCase() == 'menu' && ($(".page-active .widget [defaultselection='1']").length == 0 || $(".page-active .widget [defaultselection='1']").attr('aval') == "nolink")) {
        if (get_menu_status() == 1) {
            $('.pre-menu-container .meactive').find('a.link.parent').addClass('active');
            menuitem.Focus();

            $('.pre-menu-container ').addClass('menuactive');
            return;
        }else{
            $('#pre-menu-container').hide();
        }
    } //End default Focus

    //Remove all menu active class
    $('.pre-menu-container').removeClass("active");
    $('.widget').removeClass("active");
    $('.object-wrapper').removeClass("active");
    $('.sub-menu-item').removeClass('arrow');
    $('.sub-menu-item').removeClass("active");

    if ($('.page-active .widget').find('.link.object-wrapper:visible').length > 0) {

        menuitem.RemoveFocus(); //Remove menu Focus

        ////////////////////// USER Default selection //////////////////////

        if ($(".page-active .widget [defaultselection='1']").length > 0 && $(".page-active .widget [defaultselection='1']").attr('aval') != "nolink") {
            $('.page-active .widget').find("[defaultselection='1']").first().addClass('active');
        } else { //select first object
            //$('.page-active .widget').find('.link:visible').first().addClass('active');
            var find = $('.page-active .widget').find("[first='1']").first().attr("id");
            if (find != undefined) {
                $('.page-active .widget').find("[first='1']").first().addClass('active');
            } else {
                $('.page-active .widget').find('.link:visible').first().addClass('active');
            }
        }

        $('.pre-menu-container .meactive').find('a.link.parent').addClass('active');
        FocusOnDynamicObject($('.page-active .widget .link.object-wrapper.active').attr('obid'));
        $('.pre-menu-container ').removeClass('menuactive');

        LanguagepopupHighlight(); //Language popup Highlight

    } else {
        if (menuIsEnable == 1) {
            $('.pre-menu-container .meactive').find('a.link.parent').addClass('active');
            menuitem.Focus();
            $('.pre-menu-container ').addClass('menuactive');
        }
    };

}; //End default focus

//FocusOnDynamicObject
function FocusOnDynamicObject(directionId) {
    if (directionId != '' && directionId != undefined) {
        for (var key in dynamicObject) {
            if (dynamicObject.hasOwnProperty(key)) {
                if ($("." +key+ "#object-" + directionId).length > 0) {
                    Debug("add key > " + key + " " + directionId);
                    dynamicObject[key].Focus();
                }
            }
        }
    }
}; //End dynamicObjectfocus

//Remove focus on dynamic Object
function RemoveFocusOnDynamicObject(directionId) {
    if (directionId != '' && directionId != undefined) {
        for (var key in dynamicObject) {
            if (dynamicObject.hasOwnProperty(key)) {
                if ($("." + key +"#object-" + directionId).length > 0) {
                    Debug("Remove key > " + key + " " + directionId);
                    dynamicObject[key].RemoveFocus();
                }
            }
        }
    }
}; //End RemoveFocusOnDynamicObject

//LanguagepopupHighlight
function LanguagepopupHighlight() {
    if ($('.page-active .widget .link.object-wrapper.active').find('.popup').length == 1) {
        //$('.link').removeClass("active");
        $('.page-active .widget .popup').find('img').addClass('listnavi');
    }
}; //END LanguagepopupHighlight

/*
 * Custom Debug function
 * @param : string, clear the div content & append the string
 */
Debug = function(str, clear) {
  var data = { LOG: str + " " };
//   Please remove after use, never keep below code in production push
 /* $.ajax({
    url: "http://192.168.1.20/restapi/fileread.php",
    type: "POST",
    data: JSON.stringify(data),
    async: true,
    dataType: "json", //you may use jsonp for cross origin request
    crossDomain: true,
  });

/*    if (tvbrowser == true && debugEnable == false) {
        return;
    };

    console.log(str);

    if (clear) {
        $('#debug').html('');
    };

    $('#debug').html($('#debug').html() + str + " ");
*/
}; //END Debug

/*
 * Backkey Navigation Handler
 */
function backKey() {
    //Removing the language object event if user press the language event
    if (keyList[keyList.length - 1].name == "Language") {
        var lang = { name: "Language" };
        removekeylistener(lang);
    }
    //back key functionality
    isPageLoaded = "";
    var goback = nextPrev.pop();
    if (goback != undefined) {
        PageSwitch(goback, "menu");
    };
    return keyConsumed;
}

/*
 * Handler ALL Page Navigation
 * @param : key Event
 */
function RootKeyHandler(e) {

    var keyStatus = keyAlive;
    var key = e.which || e.keyCode;

    switch (key) {

        case 37: //LEFT
            FindPageWidgetObject("left");
            keyStatus = keyConsumed;
            break;

        case 38: //UP
            FindPageWidgetObject("top");
            keyStatus = keyConsumed;
            break;

        case 39: //RIGHT
            FindPageWidgetObject("right");
            keyStatus = keyConsumed;
            break;

        case 40: //DOWN
            FindPageWidgetObject("bottom");
            keyStatus = keyConsumed;
            break;

        case 13: //OK
            if (!is_touch_device()) {
              widgetClick("OK", "", "");
              keyStatus = keyConsumed;
            }
            break;

    }; //END OF SWITCH


    if (tvbrowser == true) { // TVBrowser

        try {

            switch (key) {
                case VK_BACK: // TV Back key
                    keyStatus = backKey();
                    break;

                case VK_0:
                case VK_1:
                case VK_2:
                case VK_3:
                case VK_4:
                case VK_5:
                case VK_6:
                case VK_7:
                case VK_8:
                case VK_9:
                    keyStatus = NumericEntry(key - 48);
                    break;
            } //END OF SWITCH

        } catch (e) {
            keyStatus = keyAlive;
        }; //END OF TRY

    } else {
        switch (true) {
            case (key == 66): // 'b' key
                keyStatus = backKey();
                break;

            case (key >= 48 && key <= 57): // 0 to 9 keys
                keyStatus = NumericEntry(key - 48);
                break;
        } //END OF SWITCH
    }

    return keyStatus;

} //END ROOTKEYHANDLER

//construct alert popup to ask user to weather he want to open the external link by existing current one
function Alert_object_popup_html(){
    responses ='<div class="modals-content externallink"><div class="modals-header"><span class="modals-title">Info</span></div>';
    responses += '<div class="modals-body">Do you want to redirect to external page?</div>';
    responses +=  '<div class="modals-footer"><input type="button" class="modal-button" id="modal-cancel" value="Cancel"><input class="modal-button" id="modal-confirm" type="button" value="Confirm"></div>'
    responses +=   '</div>';
    return responses;
}



