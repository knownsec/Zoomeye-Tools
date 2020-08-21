chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){

	switch(request.types){
		case "copyoneip":
			index = 0

			iplist = [document.getElementsByClassName("search-result-item-title")[0].text];
			sendResponse({"status": true, "data": iplist});

		case "copyoneipwp":
			index = 0

			ip = document.getElementsByClassName("search-result-item-title")[index].text;
			port = document.getElementsByClassName("search-result-tags")[index].getElementsByTagName('button')[0].outerText.split('/')[0];

			iplist = [ip+":"+port];

			sendResponse({"status": true, "data": iplist});

		case "copyoneurl":
			index = 0

			ip = document.getElementsByClassName("search-result-item-title")[index].text;
			port = document.getElementsByClassName("search-result-tags")[index].getElementsByTagName('button')[0].outerText.split('/')[0];

			if (port == 80){
				protocol = "http://"
			}else if(port == 443){
				protocol = "https://"
			}

			url = protocol + ip + ":" + port

			urllist = [url];

			sendResponse({"status": true, "data": urllist});
	
		case "copyallip":
			divlist = document.getElementsByClassName("search-result-item")
			resultlist = []


			for(var i=0; i < divlist.length; i++){
				ip = divlist[i].getElementsByClassName("search-result-item-title")[0].text;
			
				resultlist.push("'" + ip + "'")
			}
			sendResponse({"status": true, "data": resultlist});
	
		case "copyallipwp":
			divlist = document.getElementsByClassName("search-result-item")
			resultlist = []


			for(var i=0; i < divlist.length; i++){
				ip = divlist[i].getElementsByClassName("search-result-item-title")[0].text;
				port = divlist[i].getElementsByClassName("search-result-tags")[0].getElementsByTagName('button')[0].outerText.split('/')[0];
			
				resultlist.push("'" + ip + ":" + port + "'");
			}
			sendResponse({"status": true, "data": resultlist});

		case "copyallipwplf":
			divlist = document.getElementsByClassName("search-result-item")
			resultlist = []


			for(var i=0; i < divlist.length; i++){
				ip = divlist[i].getElementsByClassName("search-result-item-title")[0].text;
				port = divlist[i].getElementsByClassName("search-result-tags")[0].getElementsByTagName('button')[0].outerText.split('/')[0];
			
				resultlist.push("" + ip + ":" + port + "");
			}
			sendResponse({"status": true, "data": resultlist, "withoutdot": true});

		case "copyallurl":
			divlist = document.getElementsByClassName("search-result-item")
			resultlist = []


			for(var i=0; i < divlist.length; i++){
				ip = divlist[i].getElementsByClassName("search-result-item-title")[0].text;
				port = divlist[i].getElementsByClassName("search-result-tags")[0].getElementsByTagName('button')[0].outerText.split('/')[0];
			
				if (port == 80){
					protocol = "http://"
				}else if(port == 443){
					protocol = "https://"
				}else{
					protocol = ""
				}
				url = "'" + protocol + ip + ":" + port + "'"

				resultlist.push(url);
			}
			sendResponse({"status": true, "data": resultlist});
	}

});