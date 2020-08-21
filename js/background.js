IS_LOGIN = false
TARGET_HOST = "";
SPLIT_SYMBOL = ",";
SPLIT_SYMBOL_WITHOUT_DOT = "\n";
HOST_DATA = {};
GLOBAL_TOKEN = ""

popup = chrome.extension.getViews({type:'popup'})[0];

function getHostname(url) {
    var elem = document.createElement('a');
    elem.href = url;
    return elem.hostname;
}

function checkHost(hostname){
    if (hostname == "zoomeye.org" || hostname == "www.zoomeye.org"){
        return true;
    }
    else{
        return false;
    }
}

function saveData(){
    hostdata = JSON.stringify(HOST_DATA);
    
    data = {}
    data[TARGET_HOST] = hostdata

    chrome.storage.local.set(data);
}

function dnsLookup(hostname, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.shodan.io/dns/resolve?key=MM72AkzHXdHpC8iP65VVEEVrJjp7zkgd&hostnames=' + hostname, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            try {
                var data = JSON.parse(xhr.responseText);

                if (data[hostname]) {
                    callback(data[hostname]);
                }
            }
            catch(e) {
                // pass
            }
        }
    }
    xhr.send();
}

// for host

// check login status
function checkZoomeyeloginstatus(token){
    fetch("https://www.zoomeye.org/user", {
            "headers":{"Cube-Authorization": token, "mode":"cors"}
        }).then(res => res.json())
            .then( res => {
                result = res.result;
                if (res.status != 401){
                    IS_LOGIN = true;
                }
                else{
                    chrome.storage.local.remove(["zoomeye_token"]);
                    IS_LOGIN = false;
                }
            })
    return IS_LOGIN;
}

// check login
function checkZoomeyeLogin(){

    chrome.storage.local.get(["zoomeye_token"], function(tokens){
        if (tokens['zoomeye_token']){
            IS_LOGIN = true;

            IS_LOGIN = checkZoomeyeloginstatus(tokens['zoomeye_token']);
            GLOBAL_TOKEN = tokens['zoomeye_token'];
        }
        else{
            IS_LOGIN = false;
        }
    })

    return IS_LOGIN;
}

// update host data
function getIpInfo(ip){
    is_have = false;

    // check data weather in storage
    chrome.storage.local.get([TARGET_HOST], function(hostdata){
        if(hostdata[TARGET_HOST]){
            is_have =  true;
        }
    })


    if (IS_LOGIN == true && is_have == false){
        fetch("https://www.zoomeye.org/search?q=ip%3A"+ip, {
            "headers":{"Cube-Authorization": GLOBAL_TOKEN, "mode":"cors"}
        }).then(res => res.json())
            .then( res => {
                
                // update ip
                HOST_DATA.ip = ip;

                // update host
                HOST_DATA.hostname = TARGET_HOST;

                // base_data
                HOST_DATA.port = "";
                HOST_DATA.country = "";
                HOST_DATA.protocol = "";
                HOST_DATA.datalist = [];
                HOST_DATA.token = ""

                // host data
                matches = res.matches;

                HOST_DATA.country = matches[0].geoinfo.country.names.en;
                HOST_DATA.token = matches[0].token;

                for(i=0;i<matches.length;i++){

                    if(!matches[i].portinfo)continue;

                    port = matches[i].portinfo.port;
                    service = matches[i].portinfo.service;

                    HOST_DATA.port = HOST_DATA.port + port + ",";
                    HOST_DATA.protocol = HOST_DATA.protocol + service + ",";

                    HOST_DATA.datalist.push([port, service]);


                    // save in chrome.storage
                    saveData();
                }


            })
    }
}


function updateBrowserAction(tabid, url){

    var hostname;

    // If the URL doesn't start with http or https then we won't go any further
    if (url.indexOf('http') === -1 && url.indexOf('https') === -1) {
        return;
    }
    hostname = getHostname(url);

    TARGET_HOST = hostname;

    // 当未登录时访问zoomeye页面，则获取stroage
    // request content script check login

    if (IS_LOGIN != true && checkHost(hostname) == true){
        action = "checkZoomeyeLogin"

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){

            chrome.tabs.executeScript(tabs[0].id, {code: "zoomeye_token = localStorage.getItem('token');if (zoomeye_token){chrome.storage.local.set({'zoomeye_token': zoomeye_token});}"})
        });

        checkZoomeyeLogin();
    }

    if (IS_LOGIN == true){
        dnsLookup(TARGET_HOST, getIpInfo);
    }
}

// check url
chrome.tabs.onUpdated.addListener(function (id, info, tab) {
    if (tab.status === 'loading') {
        updateBrowserAction(id, tab.url);
    }
});
chrome.tabs.onActivated.addListener(function (activeInfo) {
    if (activeInfo.tabId) {
        chrome.tabs.get(activeInfo.tabId, function (tab) {
            updateBrowserAction(tab.id, tab.url);
        });
    }
});

