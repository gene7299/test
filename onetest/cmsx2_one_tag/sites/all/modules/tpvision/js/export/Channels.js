var channelFocus = false;
var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var default_channel_logo = " ";
var channelsitem = new function() {

    this.name = "Channels"; // Class reference

    /*
     * add Keylistener to keyList
     */
    this.Focus = function() {
      addkeylistener(this);
    };

     /*
     * Remove Keylistener from keyList
     */
    this.RemoveFocus = function() {
      removekeylistener(this);
    };

    /*
     * Key Handler for ChannelBar
     * @param : keyevent
     */
    this.KeyHandler = function(e) {

      var keyStatus = keyAlive;
      var row = parseInt($('.page-active .channels-menu').attr('row'));
      var column = parseInt($('.page-active .channels-menu').attr('column'));
      var totalInnerDiv = parseInt(row) * parseInt(column);

      var totalDiv = $('.page-active .channels-menu li').length;

      switch (e.which || e.keyCode) {
        case 37: //LEFT
          if ($('.widget div.link.channels-object.active').length == 1) {
           // requestBack();
           keyStatus =   NavigateChannelGrid("left", row, column, totalInnerDiv, totalDiv);
          }
          // keyStatus = keyConsumed;
          break;

        case 39: //RIGHT
          if ($('.widget div.link.channels-object.active').length == 1) {
            //requestNext();
            keyStatus =  NavigateChannelGrid("right", row, column, totalInnerDiv, totalDiv);
          }
        //  keyStatus = keyConsumed;
          break;

        case 38: //UP
        keyStatus =  NavigateChannelGrid("up", row, column, totalInnerDiv, totalDiv);
          // keyStatus = keyConsumed;
          break;

        case 40: //DOWN
        keyStatus = NavigateChannelGrid("down", row, column, totalInnerDiv, totalDiv);
          // keyStatus = keyConsumed;
          break;

        case 13: // OK

          if ($('.widget div.link.channels-object.active').length == 1) {
            if ( (tunedSource == "MainTuner") && (currentChlNum == channelList[currentIndex].ChannelNo) ) {
              if(TVPlatform != "2K16"){ activateTvChannels();}
              // leaveSmartInfo();
            } else {
              channel_selection();
              window.setTimeout(function() {
                if(TVPlatform != "2K16"){ activateTvChannels();}
                leaveSmartInfo();
              }, 600);
              objectActionKey.isKeyAction = "tuningchannelAndExit";
            };
          }
          keyStatus = keyConsumed;
          break;

        default:
          break;

      } //END OF SWITCH

      return keyStatus;

    }; //END OF KEYHANDLER

  } //END OF CLASS

//////////////////////////////// CHANNEL BAR FUNCTIONS ////////////////////////////////

var pfmode = "";
var itemWidth = 150;
var offset = 0;
var slidespeed = 200;
var currentIndex = 0;
var currentObj = {};
var border = 2;
var itemPadding = 20;
var isAnimating = false;
var chSelection = null;
var itemheight = 80;
var offsetTime = null;
var isNetConnected = false;
var linuxTime = null;
var systemTime = null;
var mRequestForClockControl = false;
var style = null;
var tunedSource = "";
var numberSearch = "";
var intervalId = null;
var IsVideoPresent = "";
var initTimeoutid;
var channelList = [];
var currentIndex = 0;
var currentChlNum = -1;
var channeltuning = false;
var chTimeout = null;
var mRequestForNumberOfChannels = false;
var mRequestForchannelListSearchDirection = "";
var tvbrowser = false;
var mRequestForSmartInfoSwitch = false;
var mRequestForSmartInfoApp = "";
var setCallTimeout;
var reSourceRequest = false;
var apkList = [];
var previousVidioPage ="";
var manualMute = "";
var mNumberOfChannels = 0;
var ActiveApp = false;
var TVPlatform = '';
//Storing the epg information
var presentEPGInfo = {};
var followingEPGInfo = {};
var EPGInfoAvailable = false;

// for( var k=0; k<=100; k++){
//   channelList.push({
//     ChannelNo: k,
//     // ChannelLogo: default_channel_logo,
//     ChannelName: "channel-"+k,
//   })
// }
/**
* Build the EPG INFO
*/

function buildEPGInformationInObject(epgInfo, type){
  var epgtype = "next-event";
  if(type == "now"){
     epgtype = "present-event";
  }
    var data = "";
    if(epgInfo.stime != ""){
       data = epgInfo.date + " (" + epgInfo.stime + " - " + epgInfo.etime + ")";
    }
    $(".epg-info ."+ epgtype +" .start-date-time").text("Date & Time : "+ data);
    $(".epg-info ."+ epgtype +" .program").text("Event : "+ epgInfo.program);
    $(".epg-info ."+ epgtype +" .program-desc").text("Event description : "+ epgInfo.desc);
}

/*
function to navigate in the channel grid view
params: direction = left, right, top, bottom,
        row = count of rows,
        coloumn = count of columns in the grid,
        totoalInnerdiv = number of channels that will fit in the grid
        totaldiv= total number of channels available
*/

function NavigateChannelGrid(direction, row, column, totalInnerDiv, totalDiv){
  var keyStatus;
  if($('.page-active .widget .object-wrapper.channels-object li:visible').length >=1){
    //fetching the first ,last, and currently active channel in the grid
    var first = parseInt($('.page-active .channels-menu li:visible').first().attr('id').split('_')[1]);
    var last = parseInt($('.page-active .channels-menu li:visible').last().attr('id').split('_')[1]);
    var active = $('.page-active ul.channels-menu li.channel-item-active');
    //currrentindex is the currently tuned channel
    currentIndex = parseInt($('.page-active ul.channels-menu li.channel-item-active').attr('id').split('_')[1]);

  switch(direction){
    case "left": //left
        var prevChannel, prevBlock;
        //if its extreme left movements then it will continue from here
          if(currentIndex%row == 1){
            //if current doesnot has any left navigation go out of the widget
            if(currentIndex < totalInnerDiv){
              return 0;
            };
            $( ".page-active .channel-item" ).removeClass('channel-item-active')
            $(".page-active .channel-item").hide();
            //calculate the prevblcok to be displayed
            prevBlock = ((first -1) - totalInnerDiv);
            if(last>=totalInnerDiv){
              // show the current page channels items from prevblock to current first -1 channels
              $( ".page-active .channel-item" ).slice(prevBlock , (first -1)).show();
              keyStatus = keyConsumed;
            }
              prevChannel = currentIndex - ((column -1) * row + 1);
                $('.page-active .channels-menu #channel_'+prevChannel).addClass('channel-item-active');
            }else{
              //if its normal left movement then it will continue from here
                active.removeClass('channel-item-active');
                active.prev().addClass('channel-item-active');
                //current widget will be still channels
                keyStatus = keyConsumed;
            }
            break;
    case "up":  //up
              var top = currentIndex - row;
              //if current top is more then first row then only navigation will happen
              if (top>=first){
                active.removeClass('channel-item-active');
                $('.page-active #channel_'+top).addClass('channel-item-active');
                keyStatus = keyConsumed;
              }else{
                //else it will go out of the widget
                return 0;
              }
            break;
    case "right":  //right
                if(currentIndex%row == 0){
                  if(last != totalDiv){
                    $( ".page-active .channel-item" ).removeClass('channel-item-active')
                      $(".page-active .channel-item").hide();
                      //if current channel is less then totaldiv
                      if( (last + totalInnerDiv) < totalDiv){
                        $( ".page-active .channel-item" ).slice(last,  last+totalInnerDiv).show();
                      }else{
                        $( ".page-active .channel-item" ).slice(last,  totalDiv).show();
                      }
                      $('.page-active .channels-menu li:visible').first().addClass('channel-item-active');
                      keyStatus = keyConsumed;
                  }else{
                    keyStatus = keyAlive;
                  }
                }else{
                  if(currentIndex !=totalDiv){
                    active.removeClass('channel-item-active');
                    active.next().addClass('channel-item-active');
                    keyStatus = keyConsumed;
                  }
                }
            break;
    case "down":  //down
              var bottom = currentIndex + row;
              if (bottom <=last){
                active.removeClass('channel-item-active');
                $('.page-active #channel_'+bottom).addClass('channel-item-active');
                keyStatus = keyConsumed;
              }else{
                return 0;
              }
            break;
  }
  //getting the currently tuned channel
  currentIndex = parseInt($('.page-active ul.channels-menu li.channel-item-active').attr('id').split('_')[1]);
  //sending the current channel index to tune to TV channel
  //since index starts from 0 hence decreasing count by 1
  goto(currentIndex-1, "", true);
}

  return keyStatus;
}
/*
 * Build the Channel Bar list
 */
function channelsBuild() {
  /*if($('.preview').length > 0){
    default_channel_logo = base_url + "/sites/all/modules/tpvision/resource/export/channel_logo.png";
  }else{
    default_channel_logo = "sites/all/modules/tpvision/resource/export/channel_logo.png";
  }*/
  default_channel_logo = basepath+"sites/all/modules/tpvision/resource/export/channel_logo.png";
  //clearTimeout(initTimeoutid);
  if ($('.page-active .widget .object-wrapper.channels-object').length == 0) {
    return;
  };

  //Debug(" channelsBuild >> ");
  $.each(channelList, function(index, value) {
    if (value.ChannelNo == currentChlNum) {
      currentIndex = index;
      return;
    }
  });

  if ($('.page-active ul.channels-menu').length == 0) {
    return;
  };
  if (channelList.length == 0) {
    $('.page-active ul.channels-menu').html("<div class='channels-message'></div>");
    $('.page-active .channels-message').css("fontSize", "30px");
    $('.page-active .channels-message').css("position", "absolute");
    $('.page-active .channels-message').html("Channels are loading. Please Wait...");
    setTimeout(function(){
      $('.page-active .channels-message').html("Channels are not available");
      $("body").removeClass("loading");
    },3000)
    // $('.page-active .channels-message').css("left", ($('.page-active .channels-preview').width() - $('.page-active .channels-message').width()) / 2 + "px");
    $(".page-active ul.channels-menu").show();
    return;
  }
  var currentPageItem = $(".page-active .channel-style").first()[0];
  style = $(currentPageItem).attr("style");
  itemWidth = parseInt($(currentPageItem).css('width').replace("px", ""), 10);
  itemheight = parseInt($(currentPageItem).css('height').replace("px", ""), 10);
  border = parseInt($(currentPageItem).css('border-left-width').replace("px", ""), 10) * 2;
  itemMargin = parseInt($(currentPageItem).css('marginRight').replace("px", ""), 10);
  itemPadding = parseInt($(currentPageItem).css('padding-left').replace("px", ""), 10);

  if (isNaN(itemWidth) || itemWidth == 0) {
    itemWidth = 150;
  }
  if (isNaN(itemheight) || itemheight == 0) {
    itemheight = 100;
  }
  if (isNaN(border)) {
    border = 2;
  }
  if (isNaN(itemPadding)) {
    itemPadding = 30;
  }
  if ($('.page-active ul.channels-menu li.channel-item').length == 0) {
    $('.page-active ul.channels-menu').empty();
    var channelHtml='', ui;
    var chcolor = $(".page-active .channel-item").css('background-color');
    $.each(channelList, function(index, value) {
      if(value.ChannelLogo){
        channelHtml = '<li id="channel_'+ (index + 1)+'" class="channel-item" style="' + style + '" ><div class="channel-icon" style="width:100%; height:100%;"><img src="'+value.ChannelLogo+'" ></div></li>';
      }else{
        channelHtml = '<li id="channel_'+ (index + 1)+'" class="channel-item" style="' + style + '" ><div class="channel-number">' + value.ChannelNo + '</div><div class = "channel-icon"><img src="'+default_channel_logo+'" ></div><div class="channel-name">' + value.ChannelName + '</div></li>';
      }
      $(".page-active ul.channels-menu").append(channelHtml);
      ui = $('.page-active ul.channels-menu li:eq(' + index + ')');
     // $(ui).css('display', 'block');
      if (index == currentIndex) {
        $(ui).addClass("channel-item-active");
      };
      $(ui).on('click', function() {
        if (is_touch_device() == true) {
          goto($(this).index(), "", true);
        };
      });
    });
    //getting the parent widget details to adjust the channel width and height in the widget
    var res = getParentWidgetDetails();
    showChannels(res[0]['parentBlock'], res[0]['parentHeight'], res[0]['parentWidth']);
      $('.page-active .channels-preview').children('div').hide();
    $(".page-active ul.channels-menu .channel-item").css('background-color', chcolor);
  }else{
    //if already channels are build then sending focus to currently tuned channel
    showCurrentChannelSet(currentIndex);
  }
  $(".page-active ul.channels-menu").show();
  var activeChannel = $('.channels-menu li.active').index() + 1;
  if(activeChannel != currentIndex){
    showCurrentChannelSet(currentIndex);
   // $('.page-active ul.channels-menu li').removeClass('channel-item-active');
   // $('.page-active #channel_'+currentIndex).addClass('channel-item-active');
  }
};

function showChannels(ui, parentHeight, parentWidth){
  var shadow = parseInt($(".page-active .channels-menu li").css("box-shadow").split(" ")[4].replace("px",""));
  var channelPadding = 1 * $('.page-active ul.channels-menu li').css('padding-top').replace("px","");
  var channelItemWidth = ($(".page-active .channels-menu li").width() + 2 * $(".page-active .channels-menu li").css("margin-left").replace("px", "") + shadow + channelPadding);
  var channelItemHeight = ($(".page-active .channels-menu li").height() + 2 * $(".page-active .channels-menu li").css("margin-top").replace("px", "") + shadow + channelPadding);
  var heightCount =  Math.floor(parentWidth/channelItemWidth);
  var widthCount =  Math.floor(parentHeight/channelItemHeight);
  //finding the total inner div's available;
  var totalInnerDiv = widthCount * heightCount;
  $(ui).find('.channels-menu').attr({"row":heightCount, "column":widthCount, "totalinnerdiv":totalInnerDiv});
  sliceChannels('.page-active .channel-item', 0, totalInnerDiv);
}
/*
funtion to hide the selected the channels as per the specified width
*/
function sliceChannels(channel, prev, next){
  $(channel).hide();
  $(channel).slice(prev, next).show();
}

function getParentWidgetDetails(){
  var parentWidth = $('.page-active .channels-preview').parent().width() - 2 * $('.page-active .channels-preview').css("margin-left").replace("px", "");
  var parentHeight = $('.page-active .channels-preview').parent().height() - 2 * $('.page-active .channels-preview').css("margin-top").replace("px", "");
  var parentBlock = $('.page-active .channels-preview').parent();
  return [{
      'parentWidth':parentWidth,
      'parentHeight':parentHeight,
      'parentBlock':parentBlock,
  }];
}
//function to show the current set of channels if other chanenls are in focus.
function showCurrentChannelSet(currentIndex){
  var totalInnerDiv = parseInt($('.page-active .channels-menu').attr('totalinnerdiv'));
  //calculate the set of channels that should come according to currently tuned chanenl number.
  var rem = Math.floor(currentIndex/totalInnerDiv);
  sliceChannels('.page-active .channel-item', totalInnerDiv*rem, totalInnerDiv*(rem+1))

}
/*
 * Just Jump to Channel item
 * @param : item index, animation, setcall to TV
 */
function goto(index, isAnimatingOrNot, isChannelTune) {

  if (isAnimating) return;

  if (index >= 0 && index < channelList.length) {

    if($(".page-active .channel-item-active").index() != currentIndex) {
      currentIndex = index;
      currentObj = channelList[index];
    };

    $(".page-active li.channel-item").removeClass("channel-item-active");
    var chk = $(".page-active li.channel-item").get(currentIndex);
    $(chk).addClass("channel-item-active");
    if ($('.page-active .widget .video-object .broadcast-object').length == 1){
      if (isChannelTune == true && channeltuning == false) {
        clearTimeout(chSelection);
        chSelection = window.setTimeout(channel_selection, (2 * 1000), channelList[currentIndex].ChannelNo);
      };
    }

  } // END IF

}; // END GOTO

/*
 * go to Next Channel item Navigation
 */
function goNext() {
  goto(currentIndex + 1, "", true);
};

/*
 * go to Previous Channel item Navigation
 */
function goPrevious() {
  goto(currentIndex - 1, "", true);
};

/*
 * tuned Source OR Broadcast
 */
function setBroadcastOrExt() {
  clearTimeout(setCallTimeout);
  Debug("setBroadcastOrExt Channe broadcast tunedSource > "+ tunedSource);
  if($('.page-active .widget .video-object .broadcast-object #vidObject').length == 0) {
    $('.page-active .widget .video-object .broadcast-object').html('<object id="vidObject" style="width: 100%; height: 100%;" type="video/broadcast"> </object>');
  };

  IsVideoPresent = "";

  if(tunedSource == "None") {
    if(channelList.length > 0) {
      try {
        vidObject.bindToCurrentChannel();
        console.log("vidObject.bindToCurrentChannel()");
      } catch (e) {
        //
      };

      reSourceRequest = true;
      requestToSource();
      setCallTimeout = window.setTimeout(function() {
        if(reSourceRequest == true){
          reSourceRequest = false;
          if ( (tunedSource == "None") || (tunedSource == "MainTuner") || (tunedSource == "") ){
            channel_selection();
          } else {
            switchToSource(tunedSource);
          };
        };
      }, 4000);
    };
  } else if (tunedSource == "MainTuner") {
      channel_selection();
  } else if ( (tunedSource != "") && (tunedSource != "MainTuner") ) {
      switchToSource(tunedSource);
  };

};

/*
 * Search broadcast Object & Start
 */
function broadcastVideoStart(pageid, previousPageId) {
  clearTimeout(setCallTimeout);
  if ($('.menu-page-'+pageid+' .widget .video-object .broadcast-object').length == 1) {
    //getAudioControl();
    window.setTimeout(function() {
      setBroadcastOrExt();
    }, 500);
  }else{
      /**
        In first page we are not adding the dummy video
        if previous page contain boardcast then we are checking the current page
        if current oage contain the video/palylist video then we are ignoring the dummy video
      */
      if($(".menu-page-" + pageid + " .video-object .content-wrapper").length == 0 &&
          $(".menu-page-" + pageid + " .playlist-object .playlist-video").length == 0  &&
          $('.menu-page-'+previousPageId+' .widget .video-object .broadcast-object').length > 0 &&
          previousPageId != 0 ){
          if ($("body").hasClass("page-website-view") && TVPlatform != "android") {
            Debug("Added dummy video in the page " + previousPageId);
            console.log("Added dummy video in the page " + previousPageId);
            $('#digitalvideo').html("<video class=\"dvideo\" width=\"1\" height=\"1\" autoplay> <source src=\"sites/all/modules/tpvision/view_website/dvideo.mp4\" type=\"video/mp4\"> <source src=\"sites/all/modules/tpvision/view_website/dvideo.mp4\" type=\"video/ogg\"> </video>");
	    window.setTimeout(function() {
	  	$('#digitalvideo .dvideo').trigger('pause');
      	    }, 1000);
          //stopTheChannelBroadcast(currentChlNum);
        }
      };
   //};
  }

  if($(".page-active .widget .channels-preview").length > 0){
    if(channelList.length > 0){
      goto(currentIndex, "noAni", false);
    };
  };

//  previousPageId = pageid;
  // if($('.page-active .gadget-object').length > 0) {
  //   changegadgethtmlobject();
//  };
}

/*
 * Digit Entry From Remote keys
 * @param : key code
 */
function NumericEntry(key) {
  Debug("NumericEntry > "+key);
  if(key == 0 && debugEnable == true){
    Debug("", true);
  };

  if ( (objectActionKey.isNumericEntryEnable == false) || (objectActionKey.isNumericEntryEnable == "0") ) {
    return keyAlive;
  };

  if ((key >= 0) & (key <= 9) && numberSearch.length < 4 && channelList.length > 0 && parseInt(numberSearch+"0", 10) < 3000) {
    numberSearch = numberSearch+""+key;
    objectActionKey.isKeyAction = "";

    SetTime(function() {
      var nextChannel = -1;
      var num = parseInt(numberSearch, 10);
      for (var val = 0; val < channelList.length; val++) {
        if(channelList[val].ChannelNo == num){
          nextChannel = channelList[val].ChannelNo;
          break;
        }
      };
      if(nextChannel != -1){
        objectActionKey.isKeyAction = "tuningchannelAndExit";
        selectChannelFromTV(nextChannel);
      } else {
        $('#digitalentry').html("");
        $('#digitalentry').hide();
      };
      numberSearch = "";
    });

    $('#digitalentry').html(numberSearch);
    $('#digitalentry').show();

  }; //END IF
  return keyConsumed;
}; //END NumericEntry

/*
 * Timer for 2sec delay
 */
function SetTime(callback) {
  clearTimeout(intervalId);
  intervalId = setTimeout(function() {
    clearTimeout(intervalId);
    callback();
  }, 2000);
};

/*
 * dynamic channel List Building
 */
//this function is called to set the TV model parameter else request will send wrong svc version
function setTVModel(){
  // TVModel request sending
  getProfessionalSettingsControl(ProfessionalParameters[0]['name']);
}

function channelInit() {

  mRequestForSmartInfoSwitch = false;
  ActiveApp = true;

  initClockControl();

  requestChannelSelection();
  requestChannelLength();
  requestToSource();
  requestAllApplication(["Native", "NonNative"]);

  if(!TVPlatform){
    setTVModel();

    //waiting till the tvplatform is set
    var clearModel = setInterval(function(){
      if(TVPlatform){
          clearInterval(clearModel);
          PMSInit();
      }
    }, 100);
  }

  document.addEventListener("OnKeyReceived", OnKeyReceivedHandler, false);
 // setVirtualKeyForward();
  // getAudioControl();

  /*
   * Build Channel List on Browser
   */
  var timeout = window.setTimeout(function() {
    clearTimeout(timeout);
    if (!tvbrowser && os == 'windows') {
      for( var k=0; k<=100; k++){
          channelList.push({
            ChannelNo: k,
            ChannelName: "channel-"+k,
        });
      }
      currentIndex = 0;
      currentChlNum = 5;
      reorderChannelList();
    }
  }, 2000);

};

//calling the PMS related and other JAPIT request here after the TV MODEL is set
function PMSInit(){

  // RoomID request sending
  if(TVPlatform == "2K18"){
    IdentificationSettings('RoomID');
  }else{
    getProfessionalSettingsControl(ProfessionalParameters[1]['name']);
  }

  //request PMS GUest Details to assign the variable and paste where ever it is required
  requestPMSDetails("GuestDetails");

  if($(".epg-info").length > 0){
    requestEpgInfo();
  }

  if ($('.pms-message-gadget').length > 0){
    requestPMSDetails("GuestMessages");
  }
  if ($(".guest-bill-info").length > 0){
    constructBillDetails();
    setTimeout(function() {
      requestPMSDetails("GuestBill");
    }, 1000);
  }
}
/*
 * trigger Functions
 */
function triggerFunction(){

  var counts = 0;
  for (var key in tvCommands) {
    if(tvCommands[key].isSuccess == ""){
      counts++;
    };
  };

  if(counts != 0){

    clearTimeout(cmdInterval);
    cmdInterval = setInterval(function() {
      counts = 0;
      for (var key in tvCommands) {
        if(tvCommands[key].isSuccess == ""){
          counts++;
          eval(tvCommands[key].fun)();
        };
      };
      if(counts == 0){
        clearTimeout(cmdInterval);
      };

    }, 7000);

  };

};


/*
 * Get Current Channel-item index From channelList
 */
function getChannelIndex() {
  var index = 0;
  if (currentChlNum != -1) {
    for (var i = 0; i < channelList.length; i++) {
      if (channelList[i].ChannelNo == currentChlNum) {
        index = i;
        break;
      }
    }
  }
  return index;
};

/*
 * Requestig Next Channel-item from the channelList
 */
function requestNext() {
  channelFocus = true;//Settings the channel focus
  if (channelList.length == 0 || channeltuning == true) return;
  if (currentIndex >= channelList.length - 1) {
    currentIndex = 0;
  } else {
    currentIndex = getChannelIndex();
    currentIndex++;
  }
  showCurrentChannelSet(currentIndex);
  goto(currentIndex , "", true);
};

/*
 * Requestig Previous Channel-item from the channelList
 */
function requestBack() {
  channelFocus = true; //Settings the channel focus
  if (channelList.length == 0 || channeltuning == true) return;
  if (currentIndex > 0) {
    currentIndex--;
  } else {
    currentIndex = channelList.length - 1;
  }
  showCurrentChannelSet(currentIndex);
  goto(currentIndex, "", true);
};

//////////////////////////////// TV FUNCTION ////////////////////////////////

var svc = "WIXP";
var svcVer = "1.0";
var filters = ["ALL"]; //ALL, FreePackage

var wixp = wixp || new Object();
wixp.CMD_TYPE_REPORT = "Response";
wixp.CMD_TYPE_CHANGE = "Change";
wixp.CMD_REQUEST = "Request";
wixp.FUN_CHANNELLIST = "ChannelList";
wixp.PMS = "PMS";
wixp.FUN_CHANNELSELECTION = "ChannelSelection";
wixp.FUN_CLOCKCONTROL = "ClockControl";
wixp.FUN_EPG = "EPG";
wixp.FUN_PROFESSIONALSETTINGSCONTROL = "ProfessionalSettingsControl";
wixp.FUN_SOURCE = "Source";
wixp.FUN_APPLICATIONCONTROL = "ApplicationControl";
wixp.FUN_AUDIOCONTROL = "AudioControl";
wixp.FUN_USERINPUTCONTROL = "UserInputControl";

var ProfessionalParameters = [{"name" : "TVModel", "pro" : ""}, {"name": "RoomID", "pro": ""}]; // Array for TV Variales like roomid etc..

var cmdInterval;
var tvCommands = {};
tvCommands[wixp.FUN_CHANNELSELECTION] = {"fun":requestChannelSelection, "isSuccess":""};
tvCommands[wixp.FUN_CHANNELLIST] = {"fun":requestChannelLength, "isSuccess":""};

/*
 * return Object
 */
  function baseWIXPobject() {
  this.Svc = "WIXP";
   if(TVPlatform == "2K18"){
    this.SvcVer = "4.0";
   }else if(TVPlatform == "android"){
      this.SvcVer = "3.0";
    } else {
    this.SvcVer = "1.0";
  }
};

/*
 * Setcall to TV for channel selection
 * @param : Channel number
 */
function channel_selection(channelNo) {
  $.each(keyList, function(key, val){
    if(val.name == "Channels"){
      channelFocus = true;
    }
  });
  // if(channelList.length > 0 && ( $.inArray("Channels", keyList) != -1)) {
  if(channelList.length > 0) {
    clearTimeout(chSelection);
    if (channelNo == undefined) {
      currentObj = channelList[currentIndex];
      channelNo = channelList[currentIndex].ChannelNo;
      selectChannelFromTV(channelNo);
      channelFocus = false;//Allowing only once for tunning
    }else {
      if(channelFocus){
        selectChannelFromTV(channelNo);
      }
      channelFocus = false;//Allowing only once for tunning
    }
    //Debug(" channelNo > " + channelNo);
  };
};

/*
 * Get System Timer
 * @param : return to function callback
 */
function ClockControl(fn) {
  var da = null;
  if (offsetTime == null) {
    mRequestForClockControl = false;
    requestClockControl();
  }
  if (tvbrowser == false && offsetTime == null) {
    da = new Date();
  } else {
    da = new Date(Date.now() + offsetTime);
  }
  if (fn && typeof(fn) === "function") {
    fn(da);
  } else {
    return da;
  }
};

/*
 * just Init function to Get System Timer
 */
function initClockControl() {
  /*
 $.ajax({
  url: 'http://www.google.com',
  success: function(data) {
   isNetConnected = true;
  },
  error: function(data) {
   isNetConnected = false;
  }
 });
 */
  mRequestForClockControl = false;
  requestClockControl();
};

/*
 * Get TV Date & Time
 */
function requestClockControl() {
  var wixpcmd = new baseWIXPobject();
  wixpcmd.Cookie = 299;
  wixpcmd.SvcVer = "0.1";
  wixpcmd.CmdType = wixp.CMD_REQUEST;
  wixpcmd.Fun = wixp.FUN_CLOCKCONTROL;
  wixpcmd.CommandDetails = {
    "ClockControlParameters": ["ClockTime", "CurrentDate", "RefDate", "RefTime"]
  };
  send2Tv(wixpcmd);
};


/**
   Getting the EPG INFO from the tv
**/
function requestEpgInfo() {
  var wixpcmd = new baseWIXPobject();
  wixpcmd.Cookie = 299;
  wixpcmd.CmdType = wixp.CMD_REQUEST;
  wixpcmd.Fun = wixp.FUN_EPG;
  wixpcmd.CommandDetails = {
   "EPGInfoType" : "PresentAndFollowing"
  };
  send2Tv(wixpcmd);
}
/* Function to convert the Hex String to ASCII characters*/


function encode_utf8(text) {
  return text.replace(/\\u[\dA-F]{4}/gi,
    function (match) {
         return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
    });
}

/*
function encode_utf8(s) {
  var res = s.replace(/\\u/gi,'');
  var hex = res.toString();//force conversion
  var str = '';
  for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
}
*/

/**
   Getting the EPG INFO from the tv
   @param : "GuestDetails", "GuestMessages",
**/
function requestPMSDetails(param) {
  var wixpcmd = new baseWIXPobject();
  wixpcmd.Cookie = 293;
  wixpcmd.CmdType = wixp.CMD_REQUEST;
  wixpcmd.Fun = wixp.PMS;
  wixpcmd.CommandDetails = {
    "PMSParameters": {
       "RequestPMSParameters": [
        param,
      ]
    }
  };
  send2Tv(wixpcmd);
}
/*
 * Get TV Professional Settings
 * @param : Settings
 */
function getProfessionalSettingsControl(app) {
  var wixpcmd = new baseWIXPobject();
  wixpcmd.Cookie = 299,
  wixpcmd.CmdType = wixp.CMD_REQUEST;
  wixpcmd.Fun = wixp.FUN_PROFESSIONALSETTINGSCONTROL;
  wixpcmd.CommandDetails = {
    "ProfessionalSettingsParameters": [app]
  };
  send2Queue(wixpcmd);
};
//Requste RoomID 5014 only platfrom
function IdentificationSettings(app){
  var wixpcmd = new baseWIXPobject();
  wixpcmd.Cookie = 299,
  wixpcmd.CmdType = wixp.CMD_REQUEST;
  wixpcmd.Fun = wixp.FUN_PROFESSIONALSETTINGSCONTROL;
  wixpcmd.CommandDetails = {
     "ProfessionalSettingsParameters": [
          "IdentificationSettings"
    ]
  };
  send2Queue(wixpcmd);
};

/*function requestWixpCommand(wixpcmd){
  send2Queue(wixpcmd);
}*/

/*
 * Get TV Source
 */
function requestToSource() {
  var wixpcmd = new baseWIXPobject();
  wixpcmd.Cookie = 299;
  wixpcmd.CmdType = wixp.CMD_REQUEST;
  wixpcmd.Fun = wixp.FUN_SOURCE;
  send2Queue(wixpcmd);
};

/*
 * Change TV Source
 * @param : source
 */
function switchToSource(source) {
  var wixpcmd = new baseWIXPobject();
  wixpcmd.Cookie = 299;
  wixpcmd.CmdType = wixp.CMD_TYPE_CHANGE;
  wixpcmd.Fun = wixp.FUN_SOURCE;
  wixpcmd.CommandDetails = {
    "TuneToSource": source
  };

  dummyBroadcast(wixpcmd);

};

/*
 * Adding dummy Broadcast object
 * @param : command object
 */
function dummyBroadcast(wixpcmd) {

  if((pfmode == "fmode") || (objectActionKey.isKeyAction == "tuningchannelAndExit")) {
    send2Queue(wixpcmd);
    window.setTimeout(function() {
      if(TVPlatform != "2K16"){ 
        try{
          if (wixpcmd.CommandDetails.TuneToSource == "MainTuner")  activateTvChannels();
        }catch(e){
          console.log('error ', e)
        }
    
      }
    }, 200);
  } else if ($('.menu-page-'+previousPageId+' .widget .video-object .broadcast-object').length > 0) {
    send2Queue(wixpcmd);
    try {
      vidObject.bindToCurrentChannel();
      console.log("vidObject.bindToCurrentChannel()");
    } catch (e) {
      //
    };
  } else {
   /* $('#dummybroadcast').html('<object id="vidObject" style="width:100%; height:100%;" type="video/broadcast"> </object>');
    try {
      vidObject.bindToCurrentChannel();
      console.log("vidObject.bindToCurrentChannel()");
    } catch (e) {
      //
    }; */
    window.setTimeout(function() {
      send2Queue(wixpcmd);
    }, 500);
  };

}

/*
 * Change TV Application
 * @param : Application name, true || flase
 */
function switchToApplication(app, state, type) {
  if (state == undefined || state == null) {
    state = "Activate";
  }
  var wixpcmd = new baseWIXPobject();
  wixpcmd.Cookie = 299;
  wixpcmd.CmdType = wixp.CMD_TYPE_CHANGE;
  wixpcmd.Fun = wixp.FUN_APPLICATIONCONTROL;

  if(type == 'apk') {

    var cmd = "";

    Debug("apkList length > " + apkList.length);

    if(apkList.length > 0) {

      for(var k=0; k<apkList.length; k++){
        if(apkList[k].ApplicationType != "Native" && app.toLowerCase().indexOf(apkList[k].ApplicationName.toLowerCase()) >= 0){
          Debug("ApplicationName > " + apkList[k].ApplicationName);
          cmd = {"ApplicationDetails": { "ApplicationName": apkList[k].ApplicationName, "ApplicationType": apkList[k].ApplicationType }, "ApplicationState": state };
          break;
        };
      };

      if(cmd == ""){
        cmd = {"ApplicationDetails": { "ApplicationName": app, "ApplicationType": "NonNative" }, "ApplicationState": state };
      }

      wixpcmd.CommandDetails = cmd;

    } else {
      wixpcmd.CommandDetails = {"ApplicationDetails": { "ApplicationName": app, "ApplicationType": "NonNative" }, "ApplicationState": state };
    };

  } else {
    wixpcmd.CommandDetails = {"ApplicationDetails": { "ApplicationName": app }, "ApplicationState": state };
  };

  send2Queue(wixpcmd);
};

/*
 * Get all Current Application
 */
function requestApplicationControl() {
  var wixpcmd = new baseWIXPobject();
  wixpcmd.Cookie = 299;
  wixpcmd.CmdType = wixp.CMD_REQUEST;
  wixpcmd.Fun = wixp.FUN_APPLICATIONCONTROL;
  send2Queue(wixpcmd);
};

/*
 * Get Current Application
 * @param : ApplicationName
 */
function requestApplication(app) {
  var wixpcmd = new baseWIXPobject();
  wixpcmd.Cookie = 299;
  wixpcmd.CmdType = wixp.CMD_REQUEST;
  wixpcmd.Fun = wixp.FUN_APPLICATIONCONTROL;
  wixpcmd.CommandDetails = {
    "ApplicationName": app
  };
  mRequestForSmartInfoApp = app;
  mRequestForSmartInfoSwitch = true;
  send2Queue(wixpcmd);
};

function requestAllApplication(filter) {
  var wixpcmd = new baseWIXPobject();
  wixpcmd.Cookie = 299;
  wixpcmd.CmdType = wixp.CMD_REQUEST;
  wixpcmd.Fun = wixp.FUN_APPLICATIONCONTROL;
  wixpcmd.CommandDetails = { "RequestListOfAvailableApplications": { "Filter": filter } };
  send2Queue(wixpcmd);
}

/*
 * Change TV Application
 * @param : ApplicationName
 */
function changeApplication(app) {
  var wixpcmd = new baseWIXPobject();
  wixpcmd.Cookie = 299;
  if(app == "Googlecast"){
    wixpcmd.Cookie = 302;
  }
  wixpcmd.CmdType = wixp.CMD_TYPE_CHANGE;
  wixpcmd.Fun = wixp.FUN_APPLICATIONCONTROL;
  if ( (app == "Miracast" || app == "Directshare" ) && (isOldPlatform == true) ) {
    wixpcmd.CommandDetails = {
      "ApplicationDetails": {
        "ApplicationName": app,
        "ApplicationSubAction": {
          "WiFiDirectAction": {
            "Action": "StartBroadcastSSID"
          }
        }
      },
      "ApplicationState": "Activate"
    };
  } else {
    wixpcmd.CommandDetails = {
      "ApplicationDetails": {
        "ApplicationName": app
      },
      "ApplicationState": "Activate"
    };
  }
  send2Queue(wixpcmd);
  leaveSmartInfo();
};

/*
 * Exit SmartCMS Page
 */
function leaveSmartInfo() {
  pfmode = "";
  objectActionKey.isKeyAction = "";
  ActiveApp = false;
  if(gaudio){
    gaudio.pause();
  }
  //Checking only for android monitor 5011
  /*if(TVPlatform == "android"){
    unGrabVirtualKeyForward();
  }*/
  setTimeout(function(){
    switchToApplication("SmartInfo", "Deactivate");
  }, 10);

};

/*
 * Goto Particular Channel
 * @param : ChannelNumber
 */
function switchToChannel(num) {
  selectChannelFromTV(num);
};

/*
 * Get Current playing Channel
 */
function requestChannelSelection() {
  var wixpcmd = new baseWIXPobject();
  wixpcmd.Cookie = 1050;
  wixpcmd.CmdType = "Request";
  wixpcmd.Fun = wixp.FUN_CHANNELSELECTION;
  send2Queue(wixpcmd);
};

/*
 * Get total Channel Length
 */
function requestChannelLength() {
  //clearTimeout(initTimeoutid);
  var wixpcmd = new baseWIXPobject();
  wixpcmd.Cookie = 1050;
  wixpcmd.CmdType = "Request";
  wixpcmd.Fun = wixp.FUN_CHANNELLIST;
  wixpcmd.CommandDetails = {
    "ContentLevel": "NumberOfChannels",
    "Filter": filters
  };
  mRequestForNumberOfChannels = true;
  send2Queue(wixpcmd);
};

/*
 * Get All Channels
 * @param : NumberOfChannels
 */
function RequestChannelsFromTV(SearchDirection) {
  var tempChlNum = currentChlNum;
  if((tempChlNum == -1) || (tempChlNum == undefined)) {
    tempChlNum = 1;
  };
  var wixpcmd = new baseWIXPobject();
  wixpcmd.Cookie = 1050;
  wixpcmd.CmdType = "Request";
  wixpcmd.Fun = wixp.FUN_CHANNELLIST;
  wixpcmd.CommandDetails = {
    "ContentLevel": "BasicChannelDetails",
    "SearchDirection": SearchDirection,
    "SearchFromChannelNumber": tempChlNum,
    "Loop": "No",
    "NumberOfChannels": mNumberOfChannels,
    "Filter": filters
  };
  mRequestForchannelListSearchDirection = SearchDirection;
  send2Queue(wixpcmd);
};

/*
 * Set Channel to TV
 * @param : ChannelNumber
 */
function stopTheChannelBroadcast(channelNum) {
  var wixpcmd = new baseWIXPobject();
  wixpcmd.Cookie = 299;
  wixpcmd.CmdType = wixp.CMD_TYPE_CHANGE;
  wixpcmd.Fun = wixp.FUN_CHANNELSELECTION;
  wixpcmd.CommandDetails = {
    "ChannelTuningDetails": {
      "ChannelNumber": channelNum
    },
   "TrickMode" : "Stop"
  };
  send2Queue(wixpcmd);


};
/* function to activate the TV channels before deactivating the command  */
function activateTvChannels(){
  var wixpcmd = new baseWIXPobject();
  wixpcmd.Cookie = 299;
  wixpcmd.CmdType = wixp.CMD_TYPE_CHANGE;
  wixpcmd.Fun = wixp.FUN_APPLICATIONCONTROL;
  wixpcmd.CommandDetails = {
    "ApplicationDetails": {
      "ApplicationName": "TVChannels",
      "ApplicationType" : "Native",
      "ApplicationSubState" : "TVChannelAV"
     },
      "ApplicationState": "Activate"
  }
  send2Queue(wixpcmd);
}

/*
 * Set Channel to TV
 * @param : ChannelNumber
 */
function selectChannelFromTV(channelNum) {
  $('#digitalentry').html('');
  $('#digitalentry').hide();

  var wixpcmd = new baseWIXPobject();
  wixpcmd.Cookie = 1051;
  wixpcmd.CmdType = wixp.CMD_TYPE_CHANGE;
  wixpcmd.Fun = wixp.FUN_CHANNELSELECTION;
  wixpcmd.CommandDetails = {
    "ChannelTuningDetails": {
      "ChannelNumber": channelNum
    }
  };
  //send2Queue(wixpcmd);

  dummyBroadcast(wixpcmd);

};

/*
 * Get Current Audio Control
 * @param : ["Volume", "AudioMute"]
 */
function getAudioControl(mAudio) {
  var wixpcmd = new baseWIXPobject();
  wixpcmd.Cookie = 299;
  wixpcmd.CmdType = wixp.CMD_REQUEST;
  wixpcmd.Fun = wixp.FUN_AUDIOCONTROL;
  wixpcmd.CommandDetails = {"AudioControlParameters":["AudioMute"]};
  send2Queue(wixpcmd);
};

/*
 * Change TV Audio Control
 * @param : On, Off
 */
function setAudioControl(mAudioState) {
  var wixpcmd = new baseWIXPobject();
  wixpcmd.Cookie = 299;
  wixpcmd.CmdType = wixp.CMD_TYPE_CHANGE;
  wixpcmd.Fun = wixp.FUN_AUDIOCONTROL;
  wixpcmd.CommandDetails = {"AudioMute": mAudioState};
  send2Queue(wixpcmd);
};


/*
 * Change VK keys
 */
function setVirtualKeyForward() {
  var wixpcmd = new baseWIXPobject();
  //wixpcmd.SvcVer = "1.0";
  wixpcmd.Cookie = 299;
  wixpcmd.CmdType = wixp.CMD_TYPE_CHANGE;
  wixpcmd.Fun = wixp.FUN_USERINPUTCONTROL;

  wixpcmd.CommandDetails = {
    "VirtualKeyForwardMode" : "SelectiveVirtualKeyForward",
    "VirtualKeyToBeForwarded" : [ {"Vkkey" : "HBBTV_VK_0"}, {"Vkkey" : "HBBTV_VK_1"}, {"Vkkey" : "HBBTV_VK_2"}, {"Vkkey" : "HBBTV_VK_3"}, {"Vkkey" : "HBBTV_VK_4"}, {"Vkkey" : "HBBTV_VK_5"}, {"Vkkey" : "HBBTV_VK_6"}, {"Vkkey" : "HBBTV_VK_7"}, {"Vkkey" : "HBBTV_VK_8"}, {"Vkkey" : "HBBTV_VK_9"}, {"Vkkey" : "HBBTV_VK_OPTIONS"}, {"Vkkey" : "HBBTV_VK_BACK"} ]
  };

  //wixpcmd.CommandDetails = {"VirtualKeyForwardMode" : "AllVirtualKeyForward"};

  send2Queue(wixpcmd);

};


/*
 * Change ungrab VK keys
 */
function unGrabVirtualKeyForward() {
  var wixpcmd = new baseWIXPobject();
  //wixpcmd.SvcVer = "1.0";
  wixpcmd.Cookie = 299;
  wixpcmd.CmdType = wixp.CMD_TYPE_CHANGE;
  wixpcmd.Fun = wixp.FUN_USERINPUTCONTROL;
  wixpcmd.CommandDetails = {
    "VirtualKeyForwardMode" : "DontForwardAnyVirtualKey"
  };
  send2Queue(wixpcmd);
};

/*
 * remove duplicates objects
 */
function remove_duplicates(objectsArray) {
  var usedObjects = {};
  for (var i=objectsArray.length - 1;i>=0;i--) {
    var so = JSON.stringify(objectsArray[i]);
    if (usedObjects[so]) {
      objectsArray.splice(i, 1);
    } else {
      usedObjects[so] = true;
    }
  }
  return objectsArray;
};

/*
 * reorderChannelList
 */
function reorderChannelList() {
  if(channelList.length > 0 ) {
    channelList = remove_duplicates(channelList);
    tvCommands[wixp.FUN_CHANNELLIST].isSuccess = "successful";
    channelList.sort(function(a, b) {
      return parseFloat(a.ChannelNo) - parseFloat(b.ChannelNo);
    });
    currentIndex = getChannelIndex();
    channelsBuild();
    if ($('.page-active .widget .video-object .broadcast-object').length > 0) {
      Debug('IsVideoPresent >>> ' + IsVideoPresent);
      setBroadcastOrExt();
    };
  };
};

/*
function to send the GuestMessages status to update the status
params : Accepts JSON object which is sent to the JAPIT command to update the message status
*/

function setPMSMessageStatus(GuestMessages){
  var wixpcmd = new baseWIXPobject();
  wixpcmd.Cookie = 293;
  wixpcmd.CmdType = wixp.CMD_TYPE_CHANGE;
  wixpcmd.Fun = wixp.PMS;
  wixpcmd.CommandDetails = {
    "PMSParameters": {
    "Action": "UpdateGuestMessageStatus",
      "GuestMessages": GuestMessages,
    }
}
  send2Queue(wixpcmd);
}

/* function to construct the div for PMS messages */
function constructPmsMessage(id, status, message, date, time){
  $('.pms-message-gadget .pms-message-inner-right').children('.pms-message-li-items').each(function(){
    var dummy = $(this).attr('status');
    if (dummy == "dummy"){
        $(this).remove();
      }
  });
  $('.pms-message-gadget').each(function(){
     var parentId = $(this).parent().attr('id');
       //checking if the message already exists in the page , to prevent prepend for several times.
    var idFlag = checkIfMessageExists(parentId, id);
    if ((status == "New" || status == "UnRead") && idFlag){
      month = getMonthName(date);
      var font_color = $('#'+ parentId+ ' .pms-message-gadget .pms-message-inner').attr('color');
      var background_color = $('#'+ parentId+' .pms-message-gadget .pms-message-inner').attr('background_color');
      var date_time = $('#'+ parentId+' .pms-message-gadget .pms-message-inner').attr('date_time');
      html =  '<div class="pms-message-li-items" style="color:'+font_color +'; background-color:'+ background_color+'" status="'+ status +'" message_id="'+ id +'">'+ encode_utf8(message);
      html += '<div class="pms-message-time_date">'+ time +' | '+ month +'</div><div class="pms-arrow" style="border-left: 12px solid '+ background_color +'"></div></div>';
      html += '<div class="pms-message-dash-line"></div>';
      $('#'+ parentId +' .pms-message-gadget .pms-message-inner-right').prepend(html);
      if (date_time == "true"){
        $('#'+ parentId +' .pms-message-gadget .pms-message-time_date').show();
      }else {
        $('#'+ parentId + ' .pms-message-gadget .pms-message-time_date').hide();
      }
    }
  });
}

/* function to construct the div for Bill */
function constructGuestBill(currency,date,amount,details){
  var self = this;
  self.constructBill = function(){
    $('.guest-bill-info').each(function(){
        var parentId = $(this).parent().attr('id');
        var html ='',htmlres ='';
        var cur = encode_utf8(currency);
        var line_color = $('#'+ parentId+' .guest-bill-info .guest-bill-line').attr('style');
        var display_items = $('#'+ parentId+' .guest-bill-info').attr('bill_item');

        // $('#'+ parentId +' .guest-bill-info #guest-name-info').text(name);
        $('#'+ parentId +' .guest-bill-info #invoice-date-info').text(date);
        $('#'+ parentId +' .guest-bill-info #total-amount-info').text(cur +' '+ amount);

        if(display_items == "1"){
          //fetching the style of table head and table body style
          var thStyle = $('#'+ parentId+' .guest-bill-info  table thead tr').attr('style');
          var tdStyle = $('#'+ parentId+' .guest-bill-info  table tbody tr').attr('style');

          //constructing the each bill item into table
          jQuery.each(details.BillItems,function(key1,value1){
            htmlres += '<tr style="'+tdStyle+';" class="details"><td>' + encode_utf8(value1["BillItemDisplayName"]) + '</td><td style="text-align:center;">' + value1["BillItemDate"] + '</td><td style="text-align:right;">' + value1["BillItemAmount"] + '</td></tr>';
          })

            html = '<div class="guest-bill-details hide_details"><table id="bill-details-breakdown" border = "0"><thead><tr class="bill-info-title" style="'+thStyle+';"><th >Description</th><th style="text-align:center;">Date</th><th style="text-align:right;">Amount</th></tr></thead><tbody>';
            html += htmlres;
            html += '<tr><td colspan="3"><div class="guest-bill-line" style="'+line_color+'"></div></td></tr>';
            html += '<tr><td colspan="2" style="'+thStyle+';" class="bill-info-title">Total</td><td class="details" style="'+tdStyle+';">'+cur +' '+ amount+'</td></tr>'
            html+= "</tbody></table></div>"
            $('#'+ parentId +' .guest-bill-info .guest-bill-details').replaceWith(html);
        }

    });

  }
}
//function to construct the bill when the bill is not available
function constructBillDetails(){
  $('.guest-bill-info').each(function(){
    var parentId = $(this).parent().attr('id');
      $('#'+ parentId +' .guest-bill-info #invoice-date-info').html(" ");
      $('#'+ parentId +' .guest-bill-info #total-amount-info').html(" ");
      var display_items = $('#'+ parentId+' .guest-bill-info').attr('bill_item');
        if(display_items == "1"){
          $('#'+ parentId +' .guest-bill-info #bill-details-breakdown tbody tr').each(function(){
            $(this).html(' ')
          })
        }
  });
}

function checkIfMessageExists(parentId, id){
  var IdArray = [];
  $('#'+ parentId +' .pms-message-gadget .pms-message-inner-right').children('.pms-message-li-items').each(function(){
    IdArray.push(parseInt($(this).attr('message_id')));
  });
  if(jQuery.inArray(id, IdArray) == -1){
    return true;
  }
  return false;
}

function getMonthName(date){
  var split_date = date.split('/');
  return monthNames[split_date[1]-1]+ ' '+ split_date[0];
}
/*
 * Receive JSON Commond from TV
 * @param : JSON data from callback
 */
callbackDispatcher = function(data) {

  var dataToPass = JSON.parse(data);
  tvbrowser = true;
  responseDetails = dataToPass.CommandDetails;

  Debug('callbackDispatcher fun > ' + dataToPass.Fun);
  Debug('callbackDispatcher > ' + data);

  switch (dataToPass.Fun) {

    case "AudioLanguage":
      //Debug("AudioLanguage");
    break;

    case wixp.FUN_CHANNELLIST:
      var ChList = responseDetails.ChannelList;
      if (mRequestForNumberOfChannels == true) {
        mRequestForNumberOfChannels = false;
        if ((ChList.length == 0) && (responseDetails.NumberOfChannels > 0)) {
          mNumberOfChannels = responseDetails.NumberOfChannels;
          channelList = [];
          RequestChannelsFromTV("PREVIOUS");
        } else {
          reorderChannelList();
        }
      } else if (mRequestForchannelListSearchDirection == "PREVIOUS") {
        channelList = channelList.concat(ChList);
        RequestChannelsFromTV("CURRENT");
      } else if (mRequestForchannelListSearchDirection == "CURRENT") {
        channelList = channelList.concat(ChList);
        RequestChannelsFromTV("NEXT");
      } else if (mRequestForchannelListSearchDirection == "NEXT") {
        channelList = channelList.concat(ChList);
        mRequestForchannelListSearchDirection = "";
        reorderChannelList();
      };
    break;

    case wixp.FUN_CHANNELSELECTION:
      var obj = responseDetails.ChannelTuningDetails;
      if ((obj.ChannelNumber != "undefined") && (obj.ChannelNumber != undefined)) {
        currentChlNum = obj.ChannelNumber;

        var selectionStatus = responseDetails.ChannelSelectionStatus.toLowerCase();

        if ( (selectionStatus == 'successful') || (selectionStatus == 'failure') ) {
        //Getting the EPG information
        // if (isOldPlatform){
        //Not requesting the epg info if user userleaving the smartinfo
        if( objectActionKey.isKeyAction != "tuningchannelAndExit" && $(".epg-info").length > 0) {
           presentEPGInfo.date     = "";
           presentEPGInfo.stime    = "";
           presentEPGInfo.etime    = "";
           presentEPGInfo.program  = "";
           presentEPGInfo.desc     = "";
           followingEPGInfo.date   = "";
           followingEPGInfo.stime  = "";
           followingEPGInfo.etime  = "";
           followingEPGInfo.program= "";
           followingEPGInfo.desc   = "";
           buildEPGInformationInObject(followingEPGInfo, "next");
           buildEPGInformationInObject(presentEPGInfo, "now");
           // }

           requestEpgInfo();
          }

          clearTimeout(chTimeout);
          channeltuning = false;
          IsVideoPresent = selectionStatus;

          if( objectActionKey.isKeyAction == "tuningchannelAndExit" ) {
            if(TVPlatform != "2K16"){activateTvChannels();}
            leaveSmartInfo();
          };

          currentIndex = getChannelIndex();
          if(channelList.length > 0){
            goto(currentIndex, "noAni", false);
          };
        } else {
        }
        //Debug("currentIndex > " + currentIndex + " currentChlNum > " + currentChlNum);
      }
      break;

    case wixp.FUN_CLOCKCONTROL:
      linuxTime = new Date().getTime();
      if (!mRequestForClockControl) {
        mRequestForClockControl = true;
        var split = responseDetails.CurrentDate.split('/');
        var year = [split[1], split[0], split[2]].join('/');
        systemTime = new Date('' + year + ' ' + responseDetails.ClockTime + '').getTime();
        offsetTime = systemTime - linuxTime;
        //Debug("linuxTime " + linuxTime + " = " + new Date(linuxTime));
        //Debug("systemTime " + systemTime + " = " + new Date(systemTime) + " ==== " + year + ' ' + responseDetails.ClockTime);
        //Debug("offsetTime " + offsetTime);
        //Debug("Time " + new Date(linuxTime + offsetTime));
      }
      break;

    case wixp.FUN_PROFESSIONALSETTINGSCONTROL:

      if ( (responseDetails.RoomID != "undefined") && (responseDetails.RoomID != undefined) ) {
        RoomID = responseDetails.RoomID;
        $(".RoomID").html(RoomID);
      }
      if((responseDetails.TVModel != "undefined") && (responseDetails.TVModel != undefined) ) {
         var str = responseDetails.TVModel;
	//Checking the platform if model is latest one or old, if it's old model then we need to remove the video obj and place it everytime
        var model = str.substring(5,9);
     	if(model == "5011" || model == "5009" || model == "5010" || model == "3011"){
           isLatestMonitor = false;
        }
  	 var array = str.split("");
  	 if((str.substring(2,5) == "HFL") && ((array[7] == 0 && $.isNumeric(array[8])) || str.substring(7,9) == "10") && ($.isNumeric(array[0]) && $.isNumeric(array[1]) && $.isNumeric(array[5]) && $.isNumeric(array[6]))){
  	   TVPlatform = "2K14";
           isOldPlatform = true;
  	 } else {
           if(str.substring(5,9) == "3011") {
            isOldPlatform = true;
             TVPlatform = "2K16";
           } else if(str.substring(5,9) == "5014"){
            isOldPlatform = false;
            TVPlatform = "2K18";
           }else {
            isOldPlatform = false;
             TVPlatform = "android";
           }
  	 };
         Debug("TVPlatform > " + TVPlatform);
          if(TVPlatform == "android" || TVPlatform == "2K18"){
           document.addEventListener("OnKeyReceived", OnKeyReceivedHandler, false);
            Debug( "isNumericEntryEnable virtualkey: ", objectActionKey.isNumericEntryEnable );
           objectActionKey.isNumericEntryEnable && setVirtualKeyForward();
         }
      }

      if(TVPlatform == "2K18"){
        if ( (responseDetails.IdentificationSettings.RoomID != "undefined") && (responseDetails.IdentificationSettings.RoomID != undefined) ) {
          RoomID = responseDetails.IdentificationSettings.RoomID;
          $(".RoomID").html(RoomID);
        }
     }else{
        if ( (responseDetails.RoomID != "undefined") && (responseDetails.RoomID != undefined) ) {
          RoomID = responseDetails.RoomID;
          $(".RoomID").html(RoomID);
        }
      }
      break;
    case wixp.FUN_EPG:

       if (responseDetails.EPGPresentEventInfo != "" && responseDetails.EPGFollowingEventInfo != "") {
          jQuery.each(responseDetails.EPGPresentEventInfo, function(key1, value1) {
            switch(key1){
              case 'Date'       : presentEPGInfo.date = value1; break;
              case 'StartTime'  : presentEPGInfo.stime = value1; break;
              case 'EndTime'    : presentEPGInfo.etime = value1; break;
              case 'EventName'  : presentEPGInfo.program = value1; break;
              case 'Description': presentEPGInfo.desc = value1; break;
            }
          });
          jQuery.each(responseDetails.EPGFollowingEventInfo, function(key1, value1) {
            switch(key1){
              case 'Date'       : followingEPGInfo.date = value1; break;
              case 'StartTime'  : followingEPGInfo.stime = value1; break;
              case 'EndTime'    : followingEPGInfo.etime = value1; break;
              case 'EventName'  : followingEPGInfo.program = value1; break;
              case 'Description': followingEPGInfo.desc = value1; break;
            }
          });
          buildEPGInformationInObject(followingEPGInfo, "next");
          buildEPGInformationInObject(presentEPGInfo, "now");
       }
       break;

    case wixp.PMS:
          Debug("wixp.PMS > " + responseDetails);
          if (responseDetails.PMSParameters != undefined){
            GuestParams(responseDetails);
          } // end if responsedetails pms parameters
          break;
    case wixp.FUN_APPLICATIONCONTROL:
      var appName = "";
      if(responseDetails.ActiveApplications != undefined && isOldPlatform == false) {
        var ActiveAppList = responseDetails.ActiveApplications;
        Debug("wixp.FUN_APPLICATIONCONTROL > " + ActiveAppList[0].ApplicationName);
        if(ActiveAppList[0].ApplicationName == "SmartInfo"){
          ActiveApp = true;
          if (TVPlatform == "android" || TVPlatform == "2K18") {
            Debug( "isNumericEntryEnable virtualkey: ", objectActionKey.isNumericEntryEnable );
            objectActionKey.isNumericEntryEnable && setVirtualKeyForward();
          }
        } else {
		      objectActionKey.isNumericEntryEnable && unGrabVirtualKeyForward();
          if(gaudio && ActiveAppList[0].ApplicationName != "VolumeControl"){
            gaudio.pause();
          }
          ActiveApp = false;
        }
      } else if(responseDetails.ApplicationDetails != undefined) {
        if(isOldPlatform == true){
          appName = responseDetails.ApplicationDetails.ApplicationName;
        }
      } else if(responseDetails.CurrentAvailableApplicationList != undefined) {
        apkList = responseDetails.CurrentAvailableApplicationList;
      };

      if (mRequestForSmartInfoSwitch = true) {
        mRequestForSmartInfoSwitch = false;
        if (appName != "") {
          changeApplication(appName);
          mRequestForSmartInfoApp = "";
        }
      }
      Debug(" ActiveApp > " + ActiveApp + " appName " + appName);
      break;

    case wixp.FUN_SOURCE:
      tunedSource = responseDetails.TunedSource;
      if (responseDetails.TunedSource != "None" && responseDetails.TunedSource != "") {

        Debug("wixp.FUN_SOURCE tunedSource > " + tunedSource);

        if (pfmode == 'fmode') {
          clearTimeout(fullmodeTimeout);
          leaveSmartInfo();
        };

        if(reSourceRequest == true) {

          reSourceRequest = false;
          clearTimeout(setCallTimeout);

          if (tunedSource == "MainTuner") {
            channel_selection();
          } else if (tunedSource != "MainTuner") {
            switchToSource(tunedSource);
          };
        };

        if(channelList.length > 0 && currentIndex != 0) {
          goto(currentIndex, "noAni", false);
        };
      }
      break;
  } //END OF SWITCH

}; //END OF CALLBACKDISPATCHER


function GuestParams(responseDetails){
    var pms = responseDetails.PMSParameters;

    if(pms.GuestBill != undefined){
      var bill = responseDetails.PMSParameters.GuestBill;
      var currency, date, amount;
      currency = bill["Currency"];
      date = bill["TotalBillDate"];
      amount = bill["TotalDisplayAmount"];
      //creation of the constructGuestBill object and calling the function to construct the bill
      var ConstructBillObject = new constructGuestBill(currency,date,amount,bill);
      ConstructBillObject.constructBill();
  }
  if ($('.pms-message-gadget').length > 0){
    if(pms.GuestMessages !=  undefined){
      var pmsDate, pmsTime, pmsMessage, pmsID, pmsStatus;
      pms.GuestMessages.forEach(function(key, val) {
        pmsID = key["ID"];
        pmsStatus = key["Status"];
        pmsDate = key["MessageDate"];
        pmsTime = key["MessageTime"];
        pmsMessage = key["Message"];
        constructPmsMessage(pmsID, pmsStatus, pmsMessage, pmsDate, pmsTime);
      });
    }
  }
  if(pms.GuestDetails !=  undefined){
    GuestName = encode_utf8(pms.GuestDetails.DisplayName);
    if(GuestName){
      $('.GuestDetails').html(GuestName);
    }//end if GuestName is avaiable
  }//end if GuestDetails length
}
