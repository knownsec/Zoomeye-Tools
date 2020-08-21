chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){

	switch(request.action){
		case "checkZoomeyeLogin":
			zoomeye_token = localStorage.getItem('token');

			if (zoomeye_token){
				chrome.storage.local.set({'zoomeye_token': zoomeye_token});

				sendResponse({"status": true});
			}
			else{
				sendResponse({"status": false});
			}
	}

});