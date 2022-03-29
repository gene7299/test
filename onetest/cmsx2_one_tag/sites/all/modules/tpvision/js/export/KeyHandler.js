var keyAlive = 0;
var keyConsumed = 1;
var ixpqueue = new Queue();
var ixpInterval = null;
var isOldPlatform = "";
var objectActionKey = { };

var keyList = [{
  name: "Root",
  fun: 'RootKeyHandler'
}];

/*
 * Add the object to keyList
 */
function addkeylistener(item) {
  removekeylistener(item);
  keyList.push(item);
}

/*
 * Remove the object to keyList
 */
function removekeylistener(item) {
  for (var i = keyList.length - 1; i >= 0; i--) {
    if (keyList[i].name == item.name) {
      if (item.name != "Root") {
        keyList.splice(i, 1);
      }
      break;
    }
  }
}

/*
 * Default or Browser Key Handler
 */
$(document).keydown(function(e) {
  keyDownHandler(e);	
});

 function keyDownHandler(e) {  
  var keyStatus = keyAlive;
  for (var i = keyList.length - 1; i >= 0; i--) {
    if (keyList[i].name == "Root") {
      var fn = window[keyList[i].fun];
      if (typeof fn === 'function') {
        keyStatus = fn(e);
      }
    } else {
      keyStatus = keyList[i].KeyHandler(e);
    }
    if (keyStatus == keyConsumed) {
      Debug(keyList[i].name + "KeyHandler > " + e.keyCode);
      break;
    }
  }
  //$('.link.object-wrapper').blur();
  //$('.page-active .link.object-wrapper.active').focus();
  // var focused = document.activeElement;
  //console.log($(focused).attr('class'));
}

/*
 * Preview Key Injecter
 */
function InjectKey(code) {
  var e = $.Event("keydown", {
    keyCode: code,
    which: code
  }); //"keydown" if that's what you're doing
  $(document).trigger(e);
}

/*
 * Sending JSON Commond to Queue class
 */
function send2Queue(data) {
  ixpqueue.enqueue(data);  
}

/*
 * Get JSON Commond to Queue class
 */
function GetNextIxpCommand() {
  if (!ixpqueue.isEmpty() && tvbrowser) {
    send2Tv(ixpqueue.dequeue());
  }
}

/*
 * Sending JSON command to TV
 */
function send2Tv(data) {

  if (data.Fun != wixp.FUN_CLOCKCONTROL) {
    Debug(" request >> " + JSON.stringify(data));
  }

  if (data.Fun == wixp.FUN_CHANNELSELECTION) {
    var channeltuning;
    var chTimeout;
    channeltuning = true;
    clearTimeout(chTimeout);
    chTimeout = window.setTimeout(function() {
      clearTimeout(chTimeout);
      channeltuning = false;
      if(objectActionKey.isKeyAction == "tuningchannelAndExit"){       
        leaveSmartInfo();
      }
    }, 1000 * 5);
  }

  try {
    webixpObject.WebIxpSend(JSON.stringify(data));
  } catch (e) {
    //
  }

}

/*
 * Jquery or document Init function
 */
$(document).ready(function() {

  $('#digitalvideo').html('');

  objectActionKey = {"isNumericEntryEnable": false, "isKeyAction" : ""};

  //interval for Queue class
  clearTimeout(ixpInterval);
  ixpInterval = setInterval(GetNextIxpCommand, 20);

  window.setTimeout(RootInit, 100);

});

function OnKeyReceivedHandler(event){
  //Debug("OnKeyReceivedHandler > " + JSON.stringify(event));
  var res = event.detail.split(", ");  
  if(res[1] == 0) {
    keyHandler(parseInt(res[0], 10));
  }  
}

function keyHandler(key) {  

  switch (key) {
    
    case VK_BACK:    
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
    case (key >= 48 && key <= 57):         
      keyDownHandler({keyCode: key, which: key });
    break;

    case VK_ACCEPT:
      keyDownHandler({keyCode: key-17, which: key-17 });
    break;
    
    //case VK_HOME:
    case VK_MENU: 
      //if(ActiveApp) {    
        leaveSmartInfo();
      //};   
    break;

    case VK_SOURCE:
     // if(ActiveApp) {    
        leaveSmartInfo();
      //};
    break;

    case VK_SMARTTV:
    break;

    case VK_OPTIONS:
    break;

    case VK_INFO:
    break;

    case VK_GUIDE:
    break;  

    case VK_TV:
    break; 

    case VK_POWER:
    break;   

    case VK_TELETEXT:
    break;

    case VK_RED: 
    break; 

    case VK_MYCHOICE:
    break;

    case VK_CHANNELGRID:
    break;

    case VK_CLOCK:
    break;

    case VK_ALARM:
    break;   

    case VK_FORMAT:
    break;   

    case VK_SUBTITLE:
    break;     

    case VK_VOLUME_DOWN:
    break;

    case VK_VOLUME_UP:
    break;

    case VK_MUTE:
    break;

    case VK_CHANNEL_UP:
    break;

    case VK_CHANNEL_DOWN:
    break;   

    default:
    break;
  }

}
