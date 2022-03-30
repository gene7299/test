var languageitem = new function() {

  this.name = "Language"; // Class reference

  /**
   * add Keylistener to keyList
   */
  this.Focus = function() {
    addkeylistener(this);
    LanguageInit();
  };

  /**
   * Remove Keylistener from keyList
   */
  this.RemoveFocus = function() {
    removekeylistener(this);
    changeactivelang();
  };

  /**
   * Key Handler for Language
   * @param : keyevent
   */
  this.KeyHandler = function(e) {

    var keyStatus = keyAlive;

    switch (e.which || e.keyCode) {
      case 37: //LEFT
        if (scrollType == "horizontal") {
          keyStatus = LanguagePrevious();
        } else if (scrollType == "grid") {
         /* if (languageList.length > 0 && languageIndex > 0 && (((languageIndex) % rows) != 0)) {
            languageIndex--;  
            $('.lang.listview').find('.language').removeClass('listnavi');
            $(languageList[languageIndex]).addClass('listnavi');
            keyStatus = keyConsumed;
          }*/
          keyStatus = listviewNavigation("left"); 
        } else if (scrollType == "popup-on") {
          keyStatus = popupNavigation("left");
        }
        break;

      case 39: //RIGHT

        if (scrollType == "horizontal") {
          keyStatus = LanguageNext();
        } else if (scrollType == "grid") {
          /*if (languageList.length > 0 && (languageList.length != (languageIndex+1)) && (((languageIndex+1) % rows) != 0)) {
            languageIndex++;
            $('.lang.listview').find('.language').removeClass('listnavi');
            $(languageList[languageIndex]).addClass('listnavi');
            keyStatus = keyConsumed;
          }*/
          keyStatus = listviewNavigation("right");
        } else if (scrollType == "popup-on") {
          keyStatus = popupNavigation("right");
        }
        break;

      case 38: //UP

        if (scrollType == "vertical") {
          keyStatus = LanguagePrevious();
        } else if (scrollType == "grid") {
          /*if (languageList.length > 0 && ((languageIndex+1) - rows >= 0)) {
            languageIndex = languageIndex - rows;
            $('.lang.listview').find('.language').removeClass('listnavi');
            $(languageList[languageIndex]).addClass('listnavi');
            keyStatus = keyConsumed;
          }*/
          keyStatus = listviewNavigation("up");
        } else if (scrollType == "popup-on") {
          //keyStatus = keyConsumed;
          keyStatus = popupNavigation("up");
        }
        break;

      case 40: //DOWN

        if (scrollType == "vertical") {
          keyStatus = LanguageNext();
        } else if (scrollType == "grid") {
          /*if (languageList.length > 0 && ((languageIndex + rows) < languageList.length)) {
            languageIndex = languageIndex + rows;
            $('.lang.listview').find('.language').removeClass('listnavi');
            $(languageList[languageIndex]).addClass('listnavi');
            keyStatus = keyConsumed;
          }*/
          keyStatus = listviewNavigation("down");
        } else if (scrollType == "popup-on") {
          //keyStatus = keyConsumed;
          keyStatus = popupNavigation("down");
        }
        break;

      case 13: //OK
       changelanguages(); 
        keyStatus = keyConsumed;
        break;

    } //END OF SWITCH

    return keyStatus;

  }; //END OF KEYHANDLER

}; //END OF CLASS

var rows = 0;
var columns = 0;
var scrollType = "";
var languageIndex = 0;
var languageList = [];

function LanguageInit() {

  languageList = [];
  languageIndex = 0;

  var pop = $('.page-active .link.language-object .popup').length;

  if (pop > 0) {

    scrollType = "popup-off";

  } else {
    var _xPos = 0;
    var _yPos = 0;
    var languageobj = [];

    languageList = $('.page-active .link.active .listview ul li');

    for (var i = 0; i < languageList.length; i++) {
      languageobj.push($(languageList[i]).offset());
    }

    for (var i = 0; i < languageobj.length; i++) {
      if (languageobj[i].top == languageobj[0].top) {
        _xPos++;
      }
      if (languageobj[i].left == languageobj[0].left) {
        _yPos++;
      }
    }

    if (_xPos == languageobj.length) {
      scrollType = (portraitLeft) ? "vertical" : "horizontal";
    } else if (_yPos == languageobj.length) {
      scrollType = (portraitLeft) ? "horizontal" : "vertical";
    } else {
      rows = (portraitLeft) ? _xPos : _yPos;
      columns = (portraitLeft) ? _yPos : _xPos;
      scrollType = "grid";
    }
    languageIndex = $('.page-active .link.active .listview ul .listnavi').index();
    console.log("index : " + languageIndex);
  }
}

/**
 * List View
 * Get Next Language Name when RIGHT key press
 */
function LanguageNext() {
  var keyStatus = keyAlive;
  if (languageList.length > 0 && languageIndex < languageList.length - 1) {
    languageIndex++;
    $('.lang.listview').find('.language').removeClass('listnavi');
    $(languageList[languageIndex]).addClass('listnavi');
    keyStatus = keyConsumed;
  }
  Debug("languageIndex >" + languageIndex);
  return keyStatus;
} //End listview Next

/**
 * List View
 * Get Previous Language Name when LEFT key press
 */
function LanguagePrevious() {
  var keyStatus = keyAlive;
  if (languageList.length > 0 && languageIndex > 0) {
    languageIndex--;
    $('.lang.listview').find('.language').removeClass('listnavi');
    $(languageList[languageIndex]).addClass('listnavi');
    keyStatus = keyConsumed;
  }
  Debug("languageIndex >" + languageIndex);
  return keyStatus;
} //End listview Previous


/**
* Popup view 
*Getting the navigation type and navigating the channel
*/     
function listviewNavigation(type){
  var consume = 0;
  if (languageList.length > 0) {
    switch(type){
     case "left": 
          if ((languageIndex > 0)  && (((languageIndex) % columns) != 0)) {
             languageIndex--;      
             consume = 1;
          }       
          break;
     case "right": 
          if ((languageIndex < languageList.length - 1) && (((languageIndex+1) % columns) != 0)){
             languageIndex++;      
             consume = 1;
          }       
          break;
     case "up": 
          if ((languageIndex - columns) > -1){
             languageIndex = languageIndex - columns;      
             consume = 1;
          }       
          break;
     case "down": 
          if ((languageIndex + columns) < languageList.length){
             languageIndex = languageIndex + columns;      
             consume = 1;
          }       
          break;
    }
    $('.lang.listview').find('.language').removeClass('listnavi');
    $(languageList[languageIndex]).addClass('listnavi');
  } 
  Debug("languageIndex >" + languageIndex);
  return (consume) ? keyConsumed : false;
}


/**
* Popup view 
*Getting the navigation type and navigating the channel
*/     
function popupNavigation(type){
  if (languageList.length > 0) {
    switch(type){
     case "left": 
          if (languageIndex > 0){
             languageIndex--;      
          }       
          break;
     case "right": 
          if (languageIndex < languageList.length - 1){
             languageIndex++;      
          }       
          break;
     case "up": 
          if ((languageIndex - 8) > -1){
             languageIndex = languageIndex - 8;      
          }       
          break;
     case "down": 
          if ((languageIndex + 8) < languageList.length){
             languageIndex = languageIndex + 8;      
          }       
          break;
    }
    $('.select_lang_box .sel_lang').removeClass('langactive');
    $(languageList[languageIndex]).addClass('langactive');
 } 
  Debug("languageIndex >" + languageIndex);
  return keyConsumed;
}

//Language object : Set active language all pages
function changeactivelang() {
  var langname = $('.current-language').val();
  if ($(languageList[languageIndex]).attr('langname') != langname) {
    $('.lang.listview').find('.language').removeClass('listnavi');
    $('.lang.listview').find("[langname=" + langname + "]").addClass('listnavi');
  }
};

function escapeHtml(text) {
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

//Menu Translation
function menuTranslation(sellang) {
	$('.pre-menu-container .link').each(function() {
		var dlang = $('.default-language').val();
		var mnid = $(this).attr('id');
		var mt = JSON.parse($(this).attr('transtxt'));
		$.each(mt[0], function(lkey, lval) {
		 if (lkey == sellang) {
			var showtrans = ($.trim(lval) == '') && ($.trim(mt[0][dlang]) != '') ? mt[0][dlang] : ((($.trim(mt[0][dlang]) == '')) ? mt[0].title : lval);
			$('.pre-menu-container li a#'+mnid).text(showtrans);
		 }
		});
  });
  /** Adding the subpage arrow if menu contain the subppage on language change*/
    $(".pre-menu-container li.parent").each(function(){
      if($(this).find(".sub-menu-item").length > 0){
        //Checking if current menu is selected for arrow icon setup
        if($(this).parent().hasClass("active")){
          $(this).find("a.parent").html(escapeHtml($(this).find("a.parent").text())+'<div class="sub-page-arrow" style=""></div>');
         }else{
          $(this).find("a.parent").html(escapeHtml($(this).find("a.parent").text())+'<div class="sub-page-arrow" style="display:none;"></div>');
        }
        //checking the length of subpage
        
      }
    });
}


function changelanguages() {
  if (scrollType == "popup-off") {
    scrollType = "popup-on";
    //displayPopupdiv('select_lang_box'); //Display language popup
    $('.select_lang_box').fadeIn("slow");
    $('.select_lang_box .sel_lang').removeClass('langactive'); //Remove language active class in popup view
    var lnameId = $('.page-active .language-selection.popup a').attr('class').replace("lang-", ""); //Get language name
    $('.select_lang_box').find('.sel_lang #' + lnameId).parent().addClass('langactive'); //set active class for language in popup view
    languageList = $('.select_lang_box .select_lang_container').find('.sel_lang'); //get all language flag in popup view
    languageIndex = $('.select_lang_box .langactive').index();
  } else { 
    if (scrollType == "popup-on") {
      scrollType = "popup-off";
      //popup view : Set selected language for text object when popup close
      var actlang = $('.select_lang_box .sel_lang.langactive').attr('lname'); //Get selected language name
    } else {
      //Listview : Set selected language for listview
      var actlang = $('.page-active .language.listnavi').attr('langname'); //Get language name in listview
    }
    menuTranslation(actlang);
    //Settings current language in hidden field
    $('.current-language').val(actlang);

    changeThePageContentBasedOnLanguage(actlang);
    
  } //End if : checking popup on
}//End : changelanguage

function changeThePageContentBasedOnLanguage(actlang){
  pageid   = $('.page-active .widget').attr('id');
  $('.widget .text-object .content-wrapper').css('display', 'none'); //Hide all text object
  $('.widget .text-object .content-wrapper.'+actlang).css('display', 'block'); //Hide all text object

  $(".export-view .widget .text-object .marquee").each(function() {
    var html = $(this).html();
    $(this).html(html);
  });
  //Hiding the language popup
  $('.select_lang_box').hide();
  $('.select_lang_box .sel_lang').removeClass('langactive');
  //Changing the langauge of popup object
  $('.language-selection.popup a').attr("class", "lang-"+actlang);
  $('.language-selection.popup').find('img').attr('src', basepath+'sites/all/themes/tpvision/images/export/' + actlang + '.png');
  //Chnagoing the language of listview objct
  $('.language-selection.listview .language').removeClass('listnavi');
  $('.language-selection.listview  .language.'+ actlang).addClass('listnavi');

  if($('.text-object').length > 0){
   change_textobj_marquee_prop(actlang, pageid); // Set selected language for marquee
  }
}
