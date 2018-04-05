var ttt= 0;
var video_list = ['v1.mp4','v2.mp4','v3.mp4','v4.mp4','v5.mp4','v6.mp4','v7.mp4'];
//var video_list = ['v2.mp4','v3.mp4'];ddd
var video_ready_count = 0;
var index = 0;
var db = new Dexie('BBST');


function initPage(){
	initDB();
	loadVideo();
}
function startPlay(){
	console.log("!!startPlay!!");
	
}
function initDB(){
	db.version(1).stores({content:"",media:""});
}

function addonevideo(i,datauri){
	db.media.add(datauri,'vid_'+i);
}
function downloadVideo(i){
	console.log("downloadVideo["+i+"]");
	
	var videoloaderwrapper = document.getElementById('videoloader');
	videoloaderwrapper.innerHTML = '<video id="videoloader_'+i+'" style="height:1px;width:1px"></video>';
	var videoloader = document.getElementById("videoloader_"+i);

	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(){
	    if (this.readyState == 4 && this.status == 200){
	        console.log(this.response, typeof this.response);

	        var blob = new Blob([this.response], {type: "video/mp4"})
	        var freader = new FileReader();
            // onload needed since Google Chrome doesn't support addEventListener for FileReader
            freader.onload = function (evt) {
                // Read out file contents as a Data URL
                var result = evt.target.result;
                // Set image src to Data URL
                videoloader.setAttribute("src", result);
                // Store Data URL in localStorage
                try {
                    //localStorage.setItem('vid_'+i, result);
                    var promise = db.media.add(result,'vid_'+i);
                    var addSuccessful = function(x){
                    	console.log(x);
						setVideoReady(i);
						if(isAllVideoReady()){
							playVideo(0);
						}

                    } 
                    var addFail = function(err){
                    	console.log(err);
                    	setVideoReady(i);
						if(isAllVideoReady()){
							playVideo(0);
						}
                    }
                    promise.then(addSuccessful, addFail);


                }
                catch (e) {
                    console.log("Storage failed: " + e);
                }
            };
            // Load blob as Data URL
            freader.readAsDataURL(blob);
	    }
	}
	xhr.open('GET', video_list[i]);
	xhr.responseType = 'blob';
	xhr.send();  

}
function checkFileReady(i){
	var promise = db.media.get('vid_'+i);
	var checkingFileIsReady = function(vid_datauri){
		if(vid_datauri == null || vid_datauri == undefined){
			console.log("i="+i);
			downloadVideo(i);
		}else{
			setVideoReady(i);
			if(isAllVideoReady()){
				console.log("to__playVideo1!");
				playVideo(0);
			}
		}
	}
	promise.then(checkingFileIsReady,function(err){console.log(err);});
}
function loadVideo(){

	for(var i = 0 ; i < video_list.length ; i++){
		//var vid_datauri = localStorage.getItem('vid_'+i);
		checkFileReady(i);
	}

}
function setVideoReady(i){
	video_ready_count++;
}
function isAllVideoReady(){
	console.log("video_ready_count="+video_ready_count);
	console.log("video_list="+video_list.length);
	if(video_ready_count == video_list.length){
		//var videoloaderwrapper = document.getElementById('videoloader');
		//videoloaderwrapper.innerHTML = "";
		return true;
	}else{
		return false;
	}
}
function playVideo(i){
	console.log("playVideo("+i+")");
	//var videofile_datauri = localStorage.getItem('vid_'+i);
	var promise = db.media.get('vid_'+i);
	function doPlayFallBack(err){
		console.log(err);
	}
	function doPlayVideo(videofile_datauri){
		//var videofile_datauri = db.media.get('vid_'+i);
		//console.log("videofile_datauri=");
		//console.log(videofile_datauri)
		if(videofile_datauri==null){
			console.error("videofile_datauri=null");
			return;
		}
		videofile_blob = dataURItoBlob(videofile_datauri);
		console.log("videofile_blob=");
		console.log(videofile_blob)	
		var URL = this.window.URL || this.window.webkitURL;
	    var videofile_blob_url = URL.createObjectURL(videofile_blob);

		var video_player = document.getElementById("myVideo");

		video_player.setAttribute("src", videofile_blob_url);
		video_player.load();
		var playPromise = video_player.play();
		// In browsers that don’t yet support this functionality,
		// playPromise won’t be defined.
		if (playPromise !== undefined) {
		  playPromise.then(function() {
		    // Automatic playback started!
		    console.log("Playing video successful")
		  }).catch(function(error) {
		    // Automatic playback failed.
		    // Show a UI element to let the user manually start playback.
		    console.log(error)
		  });
		}
	}
	promise.then(doPlayVideo, doPlayFallBack);

}

function onVideoEnded(){
  	console.log('video ended');
    index = (index+1)%video_list.length;
	playVideo(index);
	
}
function dataURItoBlob(dataURI) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);

  // create a view into the buffer
  var ia = new Uint8Array(ab);

  // set the bytes of the buffer to the correct values
  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }

  // write the ArrayBuffer to a blob, and you're done
  var blob = new Blob([ab], {type: mimeString});
  return blob;

}