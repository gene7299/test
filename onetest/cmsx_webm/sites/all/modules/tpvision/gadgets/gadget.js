var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
var MaxTemp = {},
    MinTemp = {},
    allDays = [];
var cityWeatherDetails = [];

$(document).ready(function() {

    // autocomplete(document.getElementById("city_search"), monthNames);

    if ($(".weather-gadget").length) {
        if(window.navigator.onLine){
            $(".weather-gadget").each(function() {
                var id = $(this).parent().attr("id");
                weather_widget_gadget_script("#" + id);
            });
        }
    }
    //Added the weatherFive widget script
    if ($(".weatherFive-gadget").length) {
        if(window.navigator.onLine){
            $(".weatherFive-gadget").each(function() {
                var id = $(this).parent().parent().attr("id");
                weatherFive_widget_gadget_script('#' + id);
            });
        }
    }

    //Updating the weather widget every 30 mins once
    setInterval(function(){
        $(".weatherFive-gadget").each(function() {
            var id = $(this).parent().parent().attr("id");
            weatherFive_widget_gadget_script('#' + id);
        });
    }, 1800000);

    //Digital clock
    if ($(".gadget-object .clock").length) {
        $(".gadget-object .clock").each(function() {
            var id = $(this).parent().attr('id');
            digital_clock_gadget_script('#' + id);
        });
    }
    if ($(".social-media-widget").length){
        if(window.navigator.onLine){
            $(".social-media-widget").each(function(){
                var parentId = $(this).parent().attr('id');
                var id = parentId.split('-');
                if($(this).attr('social_feed') == 'twitter' && $(this).attr('search_type') == 'username'){
                    social_gadget_view_page_script(id[1]);
                }
                else if($(this).attr('social_feed') == 'twitter' && $(this).attr('search_type') == 'hashtag'){
                    var twitterSearchValue =  $(this).attr("keyword");
                    get_twitter_hashtag_details(twitterSearchValue, id[1])
                }else if($(this).attr('social_feed') == 'instagram' && $(this).attr('search_type') == 'user'){
                    var instaSearchValue =  $(this).attr("keyword");
                    getInstaPost(instaSearchValue,id[2]);
                }
            });
        }else{
            $(".social-media-widget").each(function(){
                var parentId = $(this).parent().attr('id');
                var id = parentId.split('-');
                if($(this).attr('social_feed') == 'twitter' ){
                    var twitMsg = '<div class="playlist-loading" style="text-align:center; margin: auto;font-size: large;color:red;">No Connection Available!!!</div>';
                    $('.social-media-'+id[1]).html(twitMsg);
                }
            });
        }
    }
});
// Create two variable with the names of the months and days in an array
function digital_clock_gadget_script(id) {
    if (!$(".widget .gadget-object .clock").length) {
        return false;
    }
    // var timeCall = null;
    setInterval(function() {
        //returning null values if current page do not have the clock widget
        if (!$(".widget .gadget-object .clock").length) {
            return false;
        }
        //  ClockControl(function(mDate) {
        var newDate = ClockControl();
        var format = $(id + ' #gadget-date').attr("format");
        if (format == "accor-date") {
            $('.clock #time').css('display','block');
            var day = dayNames[newDate.getDay()];
            var mon = monthNames[newDate.getMonth()];
            var minutes = newDate.getMinutes();
            minutes = (minutes < 10 ? "0" : "") + minutes;
            var hours = newDate.getHours();
            hours = (hours < 10 ? "0" : "") + hours;
            var seconds = newDate.getSeconds();
            seconds = (seconds < 10 ? "0" : "") + seconds;
            var dateFormat = day + ", " + mon + " " + newDate.getDate();
            $(id + ' #gadget-date').html(dateFormat);
            $(id + ' #time #sec').text(seconds);
            $(id + ' #time #hours').text(hours);
            $(id + ' #time #min').text(minutes);
        } else if (format == "accor-date1") {
            $('.clock #time').css('display','block');
            var day1 = dayNames[newDate.getDay()];
            var mon1 = monthNames[newDate.getMonth()];
            var minutes1 = newDate.getMinutes();
            minutes1 = (minutes1 < 10 ? "0" : "") + minutes1;
            var hours1 = newDate.getHours();
            hours1 = (hours1 < 10 ? "0" : "") + hours1;
            var seconds1 = newDate.getSeconds();
            seconds1 = (seconds1 < 10 ? "0" : "") + seconds1;
            var dateFormat = day1 + ", " + newDate.getDate() + " " + mon1 + " " + newDate.getFullYear();
            $(id + ' #gadget-date').html(dateFormat);
            $(id + ' #sec').text(seconds1);
            $(id + ' #hours').text(hours1);
            $(id + ' #min').text(minutes1);
        } else {
            if (format != "" && format != undefined) {
                var format1 = format.replace("dd", newDate.getDate()).replace("mm", (newDate.getMonth() + 1)).replace("yyyy", newDate.getFullYear());
                $(id + ' #gadget-date').html(format1);
            } else {
                $(id + ' #gadget-date').html(newDate.getDate() + '-' + (newDate.getMonth() + 1) + '-' + newDate.getFullYear());
            }
            var seconds2 = newDate.getSeconds();
            // Add a leading zero to seconds value
            $(id + ' #sec').html((seconds2 < 10 ? "0" : "") + seconds2);
            var minutes2 = newDate.getMinutes();
            // Add a leading zero to the minutes value
            $(id + ' #min').html((minutes2 < 10 ? "0" : "") + minutes2);
            var hours2 = newDate.getHours();
            // Add a leading zero to the hours value
            $(id + ' #hours').html((hours2 < 10 ? "0" : "") + hours2);
            //});
        }
    }, 1000);
}


function weather_widget_gadget_script(id) {
    var html = '<div class="expiry-text">Sorry this gadget is expired, Please use the 5 day weather widget</div>';

    $(id + " .weather-gadget .temperature").html('');
    $(id + " .weather-gadget .details").html('');
    $(id + " .weather-gadget .temperature").html(html);
    return;
}

/**Getting the five day weather widget data
 */
function weatherWidgetHTMLConstruction(id, json, city){
    var count = 0;
    MaxTemp = {}; MinTemp = {}; allDays = [];
    var widget_type = $(id + ' .gadget').attr("weather_widget_type");
    var html = '';
    var now = new Date();
    var day = now.getDay();
    var temp_sign = $(id + ' .gadget').attr("temperature");

 //get the maximum temperature
        getMaxMinTemp(json);
        //onsole.log(JSON.stringify(json['list']));
        //reset the alldays array for min temp functionality
        //get the minimum temprature
        //getMinTemp(json);
        //Getting the current time in different country
        var getTime = json.list[1].dt_txt.split(' ')[1].split(":")[0];
       // var currHour = now.getHours();
       // var getTime = getCurrData(currHour);
        json.list.forEach(function(forecast, i) {
            //var currHour = now.getHours();
            var apiTime = forecast.dt_txt.split(' ');
            var hour = apiTime[1].split(':');
            //var getTime = getCurrData(currHour);
            if (hour[0] == getTime) {
                count++;
                if (count == 1) {
                    //$(id + ' .inner-top-left .weather-icon img').attr('src', "https://openweathermap.org/themes/openweathermap/assets/vendor/owm/img/widgets/" + forecast.weather[0].icon + ".png");
                  if (location.protocol === "https:") {
                    $(id + ' .inner-top-left .weather-icon img').attr('src', "https://openweathermap.org/img/wn/" + forecast.weather[0].icon + "@4x.png");
                  } else {
                    $(id + ' .inner-top-left .weather-icon img').attr('src', "http://openweathermap.org/img/wn/" + forecast.weather[0].icon + "@4x.png");
                  }
                    $(id + ' .inner-top-left .weather-city').html(dayNames[day] + ", " + city[0] + "  " + city[1]);

                    if (temp_sign == 'f') {
                        var temp = Math.round(forecast.main.temp * 9 / 5 + 32);
                        var temp_html = " " + temp + String.fromCharCode(176) + 'F' + "  ";
                    } else {
                        var temp_html = " " + Math.round(forecast.main.temp) + String.fromCharCode(176) + 'C' + "  ";
                    }
                    $(id + ' .inner-top-right .first-day-temp').html(temp_html);
                    $(id + ' .inner-top-right .first-day-type').html(forecast.weather[0].description + " ");
                    html = " wind " + Math.round(forecast.wind.speed) + " m/s ";

                    $(id + ' .inner-top-right .first-day-description').html(html);
                }
                //check if the day is starts from 2nd
                if (count >= 2) {
                    //to get the current day + next 4 days, checking condition for days not more than 6
                    if (day <= 6) {
                        day++;
                        if (day == 7) {
                            day = 0
                        }
                    }
                    $(id + ' .downwrap .weather-day-' + count + ' .downwrap-day').text(dayNames[day]);
//                    $(id + ' .downwrap .weather-day-' + count + ' .downwrap-icon img').attr('src', "https://openweathermap.org/themes/openweathermap/assets/vendor/owm/img/widgets/" + forecast.weather[0].icon + ".png");

                  if (location.protocol === "https:") {
                    $(id + ' .downwrap .weather-day-' + count + ' .downwrap-icon img').attr('src', "https://openweathermap.org/img/wn/" + forecast.weather[0].icon + "@2x.png");
                  } else {
                    $(id + ' .downwrap .weather-day-' + count + ' .downwrap-icon img').attr('src', "http://openweathermap.org/img/wn/" + forecast.weather[0].icon + "@2x.png");
                  }
                      if (temp_sign == 'f') {
                        var temp_min = Math.round(MinTemp[apiTime[0]] * 9 / 5 + 32);
                        var temp_max = Math.round(MaxTemp[apiTime[0]] * 9 / 5 + 32);
                        $(id + ' .downwrap .weather-day-' + count + ' .downwrap-temp').text(temp_min + String.fromCharCode(176) + "/" + temp_max + String.fromCharCode(176) + 'F');
                    } else {
                        $(id + ' .downwrap .weather-day-' + count + ' .downwrap-temp').text(Math.round(MinTemp[apiTime[0]]) + String.fromCharCode(176) + "/" + Math.round(MaxTemp[apiTime[0]]) + String.fromCharCode(176) + 'C');
                    }
                }
            }
            if (widget_type == "one"){
                for (var j = 2; j< 6; j++){
                    $(id + ' .downwrap .weather-day-' + j + ' .downwrap-day').hide();
                    $(id + ' .downwrap .weather-day-' + j + ' .downwrap-icon img').hide();
                    $(id + ' .downwrap .weather-day-' + j + ' .downwrap-temp').hide();
                }
            }else{
                for (var k = 2; k< 6; k++){
                    $(id + ' .downwrap .weather-day-' + k + ' .downwrap-day').show();
                    $(id + ' .downwrap .weather-day-' + k + ' .downwrap-icon img').show();
                    $(id + ' .downwrap .weather-day-' + k + ' .downwrap-temp').show();
                }
            }
        });
}

function weatherFive_widget_gadget_script(id) {

    var str = $(id + ' .gadget').attr("city");
    if(!str){
        return false;
    }
    //Checking if weather widget data we retrive within 1 hour
    var city = str.split(',');
    var cityFound = -1;
    var cityValue = city[0] + "," + city[1];
    var currentDate = new Date().getTime();
    for(i=0; i<cityWeatherDetails.length; i++){
        //checking if weather data for current city is retrived within 1 hour, then using the same data for other object
        if(cityWeatherDetails[i].city == cityValue){
            if(cityWeatherDetails[i].date + (60 * 60 * 1000) > currentDate){
                weatherWidgetHTMLConstruction(id, cityWeatherDetails[i].value, city);
                if($('.preview').length){
                    preventObjectOutsideCanvas(id);
                }
                return false;
            }else{
                //updating the new details for existing data
                cityFound = i;
            }
        }
    }

  if (location.protocol === "https:") {
    var myUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + city[0] + "," + city[1] + "&lang=en&type=accurate&units=metric&APPID=d5e367417991dc934345c23b485d4ca3";
  } else {
    var myUrl = "http://api.openweathermap.org/data/2.5/forecast?q=" + city[0] + "," + city[1] + "&lang=en&type=accurate&units=metric&APPID=d5e367417991dc934345c23b485d4ca3";
  }
  /*  $.getJSON("http://api.openweathermap.org/data/2.5/forecast?q=" + city[0] + "," + city[1] + "&lang=en&units=metric&APPID=d5e367417991dc934345c23b485d4ca3", function(json) {
       weatherWidgetHTMLConstruction(id, json, city);
       if(cityFound == -1){
           //Adding the new city data if city not added to list
           cityWeatherDetails.push({date:currentDate,
                                    city:cityValue,
                                    value:json});
       }else{
           cityWeatherDetails[cityFound].date = currentDate;
           cityWeatherDetails[cityFound].value = json;
       }
    });//End of getJson weather details
   */
$.ajax({
  url: myUrl,
  dataType: 'json',
  async: true,
  success: function (json) {
       weatherWidgetHTMLConstruction(id, json, city);
       if(cityFound == -1){
           //Adding the new city data if city not added to list
           cityWeatherDetails.push({date:currentDate,
                                    city:cityValue,
                                    value:json});
       }else{
           cityWeatherDetails[cityFound].date = currentDate;
           cityWeatherDetails[cityFound].value = json;
       }
    //stuff
    //...
  }
});

    //Why
    if( $('.preview').length){
        preventObjectOutsideCanvas(id);
    }
}
// returning the data after checking if currHour is multiple of 3 or not
function getCurrData(currHour) {
    var rem = (currHour % 3);
    var Time;
    if (rem == 0) {
        Time = currHour;
    } else {
        //finding the closest Hour in JSON data based on currHour
        Time = currHour + (3 - rem);
    }
    return Time;
}

function getMaxMinTemp(json) {
    var count = 0;
    //looping over each element to find the max and min temp for each day
    json.list.forEach(function(forecast, i) {
        var currDate = forecast.dt_txt.split(' ')[0];
        //if the currday data already exists in the allday[] then return false
        if (jQuery.inArray(currDate, allDays) == -1) {
            count++;
            //filling allDays if currDate is not in array
            allDays[count] = currDate;
            MaxTemp[currDate] = 0;
            MinTemp[currDate] = 200;
        } else {
            //checking temp_max if avaiable in the JSON array
            if (forecast.main.temp_max > MaxTemp[currDate]) {
                MaxTemp[currDate] = forecast.main.temp_max;
            }
            //checking temp_min if avaiable in the JSON array
            if (forecast.main.temp_min < MinTemp[currDate]) {
                MinTemp[currDate] = forecast.main.temp_min;
            }
        }
    });
}


//pms message gadgte script
function pms_message_gadget_script(id){
    //checking if the message is there or not inside gadget
    if ($(id + ' .pms-message-gadget .pms-message-inner-right').length >= 1){
        // looping over each child div and if length is 0 then only perpending the dummy message
        if ($(id + ' .pms-message-gadget .pms-message-inner-right').children('.pms-message-li-items').length == 0){
            // html var to hold the complete div
            var now = new Date();
            var day = now.getDay();
            var html =  '<div class="pms-message-li-items" status="dummy" message_id="1"><p>No Messages available.</p>';
            html += '<div class="pms-message-time_date">'+ now.getHours() +':'+now.getMinutes()+' | '+ dayNames[day] +'</div><div class="pms-arrow"></div></div>';
            html += '<div class="pms-message-dash-line"></div>';
            //prepend at the beggening
            $(id + ' .pms-message-gadget .pms-message-inner-right').prepend(html);
        }
    }
}

function social_gadget_script(id){
    $('.social-media-'+id+' .twitter-timeline').append('<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>');
}

function social_gadget_view_page_script(id){
    var search_value = $('#object-' + id + ' .social-media-widget').attr("keyword");
    setTimeout(function(){
        $('.social-media-'+id).html('<a class="twitter-timeline" href="https://twitter.com/'+search_value+'?ref_src=twsrc%5Etfw">Tweets by '+search_value+'</a><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>');
    }, 1000);
}
function getInstaPost(search_value,id){
    $.getJSON('https://api.instagram.com/v1/tags/' +search_value+ '/media/recent?access_token=8768040307.ba4c844.e2fd899a605d420589740f487cdb0d6b&count=50', function(data1){
        $.ajax({
          url: data1.pagination.next_url,
          dataType: 'jsonp',
          type: 'GET',
          async: false,
          success: function(data){

            $.getJSON('https://api.instagram.com/v1/tags/' +search_value+ '?access_token=8768040307.ba4c844.e2fd899a605d420589740f487cdb0d6b',function(data2){
                $('.social-media-'+id+' .insta-hashtag-div').html('<span style="color:#020202;">#'+search_value+'</span>  <p style="color: #5C504D;">'+data2.data.media_count+' posts</p>')
            })

            data.data.forEach(function(insta,i) {
              $('.social-media-'+id+' ul').append('<li><img src="'+insta.images.standard_resolution.url+'"></li>');
            });
          }});
      });
}
function grab_Tweets(id, response){
    var appendTo = '.social-media-' + id;
    var template = '<div class="twitter-main-div"><div class="twitter-user-details"><div class="twitter-dp"><p class ="twitter-img">{DP}</p></div>  <div class = "user-details"><p class="twitter-screen-name">  {NAME}</h1></p> <p class="twitter-name">{SNAME}</p><div class="twitter-time"><span><a href="{URL}" target="_blank" style="color: inherit;text-decoration: none;"/>{AT}</a></span></div> </div></div><div class="twitter-text"><span>{TEXT}</span></div><div class="twitter-media" >{IMG}</div></div>';
        // $('.object-'+id).empty();

        if(response.statuses != '') {
            $(appendTo).html('');
            response.statuses.forEach(function(twitter,i){
             dp = '<img src="' + twitter.user.profile_image_url + '" />';
             twitterimg = '';
             url = 'https://api.twitter.com/' + twitter.user.screen_name + '/status/' + twitter.id_str;
             twitter_sname = JSON.stringify(twitter.user.screen_name);
             sname = twitter_sname.replace(/\"/g, "");
             twitter_name = JSON.stringify(twitter.user.name)
             name = twitter_name.replace(/\"/g, "");
             text = JSON.stringify(twitter.text)
            try {
                   if (twitter.entities['media']) {
                    twitterimg = '<img src="' + twitter.entities['media'][0].media_url + '" style="max-height:auto;position:relative;margin: 0 auto;max-width: 100%;opacity:1;border-radius:20px;" />';
                  }
            } catch (e) {
                      //no media
            }
            $(appendTo).append(template
                    .replace('{TEXT}', JQTWEET.ify.clean(text))
                    .replace('{SNAME}', sname)
                    .replace('{NAME}', name)
                    .replace('{AT}', twitter.created_at)
                    .replace('{IMG}', twitterimg)
                    .replace('{DP}', dp)
                    .replace('{AGO}', JQTWEET.timeAgo(twitter.created_at))
                    .replace('{URL}', url )
                    );
            });
            $(appendTo).find("a").each(function(){
                $(this).attr("href","javascript:void(0)")
            })
        }
        else{
            $(appendTo).html('');
            $(appendTo).append("No Data Available");
        }

}

$(function() {

    JQTWEET = {
        /**
             * relative time calculator FROM TWITTER
             * @param {string} twitter date string returned from Twitter API
             * @return {string} relative time like "2 minutes ago"
             */
        timeAgo: function(dateString) {
            var rightNow = new Date();
            var then = new Date(dateString);

            // if ($.browser.msie) {
            //     // IE can't parse these crazy Ruby dates
            //     then = Date.parse(dateString.replace(/( \+)/, ' UTC$1'));
            // }

            var diff = rightNow - then;

            var second = 1000,
            minute = second * 60,
            hour = minute * 60,
            day = hour * 24,
            week = day * 7;

            if (isNaN(diff) || diff < 0) {
                return ""; // return blank string if unknown
            }

            if (diff < second * 2) {
                // within 2 seconds
                return "right now";
            }

            if (diff < minute) {
                return Math.floor(diff / second) + " seconds";
            }

            if (diff < minute * 2) {
                return "about 1 minute ago";
            }

            if (diff < hour) {
                return Math.floor(diff / minute) + " minutes";
            }

            if (diff < hour * 2) {
                return "about 1 hour ago";
            }

            if (diff < day) {
                return  Math.floor(diff / hour) + " hours";
            }

            if (diff > day && diff < day * 2) {
                return "yesterday";
            }

            if (diff < day * 365) {
                return Math.floor(diff / day) + " days";
            }

            else {
                return "over a year ago";
            }
        }, // timeAgo()


        /**
             * The Twitalinkahashifyer!
             * http://www.dustindiaz.com/basement/ify.html
             * Eg:
             * ify.clean('your tweet text');
             */
        ify:  {
            link: function(tweet) {
            return tweet.replace(/\b(((https*\:\/\/)|www\.)[^\"\']+?)(([!?,.\)]+)?(\s|$))/g, function(link, m1, m2, m3, m4) {
                var http = m2.match(/w/) ? 'http://' : '';
                return '<a class="twtr-hyperlink" target="_blank" href="' + http + m1 + '">' + ((m1.length > 25) ? m1.substr(0, 24) + '...' : m1) + '</a>' + m4;
            });
            },

            at: function(tweet) {
            return tweet.replace(/\B[@＠]([a-zA-Z0-9_]{1,20})/g, function(m, username) {
                return '<a target="_blank" class="twtr-atreply" href="http://twitter.com/intent/user?screen_name=' + username + '">@' + username + '</a>';
            });
            },

            list: function(tweet) {
            return tweet.replace(/\B[@＠]([a-zA-Z0-9_]{1,20}\/\w+)/g, function(m, userlist) {
                return '<a target="_blank" class="twtr-atreply" href="http://twitter.com/' + userlist + '">@' + userlist + '</a>';
            });
            },

            hash: function(tweet) {
            return tweet.replace(/(^|\s+)#(\w+)/gi, function(m, before, hash) {
                return before + '<a target="_blank" class="twtr-hashtag" href="http://twitter.com/search?q=%23' + hash + '">#' + hash + '</a>';
            });
            },

            clean: function(tweet) {
            return this.hash(this.at(this.list(this.link(tweet))));
            }
        } // ify

    };


});


function initialize_oauth_variables(consumer_key){
     //creating a new OAuth object for API
    var request = new OAuth({
        consumer:consumer_key,
    });

    var oauth = {
      oauth_consumer_key: consumer_key,
      oauth_nonce: request.getNonce(),
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: parseInt(new Date().getTime()/1000, 10),
      oauth_version: "1.0",
      };

    return oauth;
  }

function OAuthCall(options){
    if(!(this instanceof OAuthCall)) {
        return new OAuthCall(options);
    }
    if(!options) {
        options = {};
    }
    if(!options.consumer_key) {
        throw new Error('consumer Key option is required');
    }
    var self = this;
    this.url = options.url;
    this.app_id = options.app_id
    this.consumer_key = options.consumer_key;
    this.consumer_secret = options.consumer_secret;
    this.proxy_url = "https://cors-anywhere.herokuapp.com/";
    /**
     * @param {object} query - has url parameters that needs to processed
     * @return {obejct} with all query parameters that can be used to generate url encoded format
     */
    this.setQueryParameter = function(query){
        var Qparams = {};
        if(!query){
            throw new Error('Query parameters is required');
        }
        for(q in query){
            Qparams[q] = query[q];
        }
        return Qparams;
    }


    this.buildAuthorizationHeader = function(oauth){
        //first argument for the header
        r = '';
        values = '';
        //constructing the string for the base url to be used while generating oauth signature
        for (key in oauth) {
            values += key+"=\"" + encodeURIComponent(oauth[key]) + "\""+ ',';
        }
        //concatinating the header values with on another.
        r += values.split(',');
        return r.slice(0, -1);
    }
    //key sort function for sorting the oauth parameters before encoding to generate the signature
    this.ksort = function(obj){
        var keys = Object.keys(obj).sort()
        , sortedObj = {};

        for(var i in keys) {
        sortedObj[keys[i]] = obj[keys[i]];
        }
        return sortedObj;
    }
    //this can be used to make the complete base string for generating oauth signature
    this.buildBaseString = function(baseURI, method, params){
        var r = '';
        params = this.ksort(params);
        //generating the url encoded string that has to be used in the oauth signature
        for(key in params) {
            r += key+"=" + encodeURIComponent(params[key]) + '&';
        }
        //removing the last & from string.
        r = r.slice(0, -1);
        //returns the encoded format with method for oauth signature
        return method + "&" + encodeURIComponent(baseURI) + '&' + encodeURIComponent(r);
    }
    /**
     * @params {object} id - gadget-object id to be used for jquery
     * @params {object} query - url parameters
     * @params {object} oauth - OAuth data to be used while authentication in url call
     */
    this.makeCall = function(id, query, oauth){
        //this is required for the encoding of the oauth_signature generation
        var base_info = this.buildBaseString(options.url, 'GET', merge_array(this.setQueryParameter(query), oauth));
        // encoding the oauth consumer secret
        var composite_key = encodeURIComponent(this.consumer_secret) + '&';
        // encrypting the oauth_signature and converting to base 64 using SHA1 mehtod.
        var oauth_signature = (CryptoJS.HmacSHA1(base_info, composite_key)).toString(CryptoJS.enc.Base64);
        //added the oauth_signature to main header collection
        oauth['oauth_signature'] = oauth_signature;
        var returned_value;
        //this is the main header to be sent to the API
        //calling the url for the data using ajax.
        $.ajax({
                url:  self.proxy_url + self.url +'?'+ $.param(self.setQueryParameter(query)),
                type:'GET',
                // async:false,
                contentType: 'application/x-www-form-urlencoded',
                headers: {
                    'Authorization': 'OAuth '+  self.buildAuthorizationHeader(oauth),
                    "X-Requested-With":"XMLHttpRequest",
                    // 'Yahoo-App-Id': self.app_id,
                },
                success : function(response){
                    // returned_value =  (JSON.stringify(response))
                    grab_Tweets(id, response)
                },
                error : function(err){
                    $('.social-media-' + id).html('');
                    $('.social-media-' + id).append("No Data Available");
                }
            });
            // return returned_value;
    }
  }

  function merge_array(arr1, arr2){
    for(i in arr2){
        arr1[i] = arr2[i];
    }
    return arr1;
  }

  function get_twitter_hashtag_details(query_value, id) {
    var appendTo = '#object-' + id + " .social-media-widget div:first";
    var basepath;
    var userAgent = window.navigator.userAgent;
    if (userAgent.match(/Windows/i) && $('.preview').length > 0){
        basepath = '../../';
    }else if($('.preview').length > 0){
        basepath = '../../../';
    }else{
        basepath = '';
    }
    var twitLoading = '<img class="playlist-loading" style="text-align:center; margin: auto; top: 20px;  margin-left: 45%;position:relative;" src="'+ basepath +'sites/all/modules/tpvision/resource/export/playlistloading.gif">';
    $(appendTo).html(twitLoading);
    //following are the required consumer parameters for the API
    var options = {
        url :'https://api.twitter.com/1.1/search/tweets.json',
        app_id: '15975795',
        consumer_key :'ozeZ8MphrmOYRk5cRqZCTsXRH',
        consumer_secret:'vIhyjiDvmfkm6yZ2JbskIRE399jbYHcfcHCc9WXmyByw45LC7s',
    }
    var query = {
      q: query_value,
      result_type: 'recent',
      count:5,
      }

    var oauth = initialize_oauth_variables(options.consumer_key);
        //data stored in a object so to construct the base info
    var auth_call = new OAuthCall(options);
    auth_call.makeCall(id, query, oauth);

  }
