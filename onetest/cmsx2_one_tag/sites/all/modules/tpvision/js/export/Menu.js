var menuItemHeight  = "100%";
var menuitem = new function() {

    this.name = "Menu"; // Class reference

    /**
     * add Keylistener to keyList
     */
    this.Focus = function() {
      if(menuIsEnable == 1) {
        addkeylistener(this);
      }
    };

    /**
     * Remove Keylistener from keyList
     */
    this.RemoveFocus = function() {
      removekeylistener(this);
    };

    /**
     * Key Handler for Menu
     * @param : keyevent
     */
    this.KeyHandler = function(e) {

      var keyStatus = keyAlive;

      switch (e.which || e.keyCode) {
        case 37: //LEFT Parent Menu Navigation
          //parent-navi
         if ($('.menu_type').val() == "1") {
            parentMenuNavi('prev');
            keyStatus = keyConsumed;
         }else{
            $('.pre-menu-container .meactive').find('.sub-menu').hide('slow');
            $('.pre-menu-container .meactive').css("height", menuItemHeight + "px");
         }
         break;

        case 39: //RIGHT Parent Menu Navigation
         if ($('.menu_type').val() == "1") {
            parentMenuNavi('next');
            keyStatus = keyConsumed;
         }else{
            $('.pre-menu-container .meactive').find('.sub-menu').hide('slow');
            $('.pre-menu-container .meactive').css("height", menuItemHeight + "px");
         }
         break;

        case 38: //UP Submenu Naivigation
          $('.arrow').attr('style', '');
          //$('.arrow').find('a').attr('style', '');
	  $('.arrow').find('a').css("border", "0px solid #fff");
          $('.sub-menu-item').removeClass('arrow');
          if (subMenuList.length > 0 && subMenuIndex >= 0) {
              subMenuIndex--;
            if (subMenuIndex == -1) {
              $('.pre-menu-container .meactive').find('.sub-menu').hide('slow');
              $('.pre-menu-container .meactive').css("height", menuItemHeight + "px");
            } else {
              $(subMenuList[subMenuIndex]).addClass('arrow');
              $(subMenuList[subMenuIndex]).find('a.link').addClass('active');
              set_sub_menu_bg(txt_color);
            }
          }else{
             if($('.menu_type').val() == "2"){
                parentMenuNavi('prev');
                keyStatus = keyConsumed;
             }
          }
         // keyStatus = keyConsumed;
          break;

        case 40: //DOWN Submenu Naivigation
          $('.arrow').attr('style', '');
          //$('.arrow').find('a').attr('style', '');
	  $('.arrow').find('a').css("border", "0px solid #fff");
          $('.sub-menu-item').removeClass('arrow'); //Remove Submenu hightlight border
          $('a.link.sub-menu-item').removeClass('active'); //Remove Submenu hightlight border
          if (subMenuIndex == -1) {
            subMenuList = $(".pre-menu-container li a.active").parent().find("ul li.mLink"); //Get all subMenu List
          }


          if (subMenuList.length > 0 && subMenuIndex < subMenuList.length - 1) {
            subMenuIndex++;
            if (subMenuIndex == 0) {
              $(subMenuList[subMenuIndex]).find('a.link').addClass('active'); //Add active class for Submenu
              $('.pre-menu-container .meactive').find('.sub-menu').show('slow'); //Show Submenu item
              $('.pre-menu-container .meactive').css("height", "100%");
            }
            $(subMenuList[subMenuIndex]).addClass('arrow');
            $(subMenuList[subMenuIndex]).find('a.link').addClass('active');
            set_sub_menu_bg(txt_color); //Set active Submenu hightlight color
            keyStatus = keyConsumed;
          }else{
            if($('.menu_type').val() == "2"){
               parentMenuNavi('next');
               keyStatus = keyConsumed;
            }

            subMenuIndex = -1;
              $('.sub-menu').hide('slow');
              $('.pre-menu-container .meactive').css("height", menuItemHeight + "px");
              if ($('.page-active .widget').find('.link.object-wrapper').length == 0) {
                 keyStatus = keyConsumed;
              }

          }
          break;

        case 13: // OK
          isPageLoaded = "";
          $('.arrow').attr('style', '');
          //$('.arrow').find('a').attr('style', '');
          $(".arrow").find("a").css("border", "0px solid #fff");
          if (subMenuIndex == -1) {
            pageid = $(".pre-menu-container .link.parent.active").attr("pval"); //Get Parent Menu page value
          } else {
            pageid = $(subMenuList[subMenuIndex]).attr("pval"); //Get Child Menu page value
          }
	  nextPrev.push($('.page-active').attr('pageid'));
	  $('.sub-menu').hide('slow');
          $('.pre-menu-container .meactive').css("height", menuItemHeight + "px");
	  $.unique(nextPrev);
          nextPrev.sort(function(a, b){return a-b});
          subMenuIndex = -1;
          PageSwitch(pageid, 'menu');
          keyStatus = keyConsumed;
          break;

      } //END OF SWITCH

      return keyStatus;

    }; //END OF KEYHANDLER

  } //END OF CLASS

var subMenuList = [];
var subMenuIndex = -1; // focuson Main Menu
var menuIsEnable = 0; //Set default focus :  Menu or user selected object
var getactivepage = "";
var menustyletype = $('.menu_style_type').val();
/**
 * Add border hightlight for active subpage menu
 */
function set_sub_menu_bg(bg) {
  $('.arrow').find('a').css({
    'border': '1px solid ' + bg,
  });
}; //End hightlight submenu

function get_menu_status() {

  if ($('.menu_disable').val() == 1) {
    menuIsEnable = 0;
  } else {
    menuIsEnable = 1;
  }
  /*if(parseFloat($('#pre-menu-container').css('background-color').split(',')[3], 10) <= "0.1"){
    menuIsEnable = 1;
  }*/

  if($('#pre-menu-container .mLink').length <= 1){
    menuIsEnable = 0;
    $('#pre-menu-container').hide();
  } else {
    $('#pre-menu-container').show();
  }

  return menuIsEnable;
}

function parentMenuNavi(naviaction){
    $('.arrow').attr('style', '');
    if (naviaction == "next") {
      getactivepage = $(".pre-menu-container li.meactive").nextAll('.pre-menu-container li.mLink').first();
    }else{
      getactivepage = $(".pre-menu-container li.meactive").prevAll('.pre-menu-container li.mLink').first();
    }
    pageid = getactivepage.attr('pval'); //Get preview page value
    if (pageid != undefined) {
        subMenuIndex = -1;
        PageSwitch(pageid, 'menu', 'menu'); //Switch one page to anthor page and set selected page hightlight
    }
}

