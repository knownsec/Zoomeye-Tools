TARGET_HOST = "";
HOST_DATA = {};

popup = chrome.extension.getViews({type:'popup'})[0];
chrome.storage.local.clear(function() {
    var error = chrome.runtime.lastError;
    if (error) {
        console.error(error);
    }
});
function getAPIData(site, callback){
    //IP判断
    if(site.match(/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/)){
        url=`https://api.zoomeye.org/chrome_plug/search?ip=${site}`;
    }
    else{
        url=`https://api.zoomeye.org/chrome_plug/search?site=${site}`;
    }
    fetch(url)
    .then(res=>res.json())
    .then(res=>{
        if(res['error']){
            callback(res);
        }
        else if(JSON.stringify(res)=='{}'){
            callback({'error':'empty'});
        }
        else if((res.port_list.length==1)&&(res.port_list[0]=="")){
            if(res.ip instanceof Array){
                getAPIData(res.ip[0],callback);
            }
            else{
                getAPIData(res.ip,callback);
            }
        }
        else{
            callback(res);
        }
    })
    .catch((error)=>{
        callback({'error':error.toString()});
    });
}


function saveData(TARGET_HOST,res){
    hostdata = JSON.stringify(res);
    let data = {};
    data[TARGET_HOST] = hostdata;
    chrome.storage.local.set(data);
}

// 右键zoomeye搜索
chrome.contextMenus.create({
    id: "ZoomEye",
    title:"使用 ZoomEye 搜索 '%s'",
    contexts: ['selection'], // 只有当选中文字时才会出现此右键菜单
    onclick: function(params){
        chrome.tabs.create({url: `https://www.zoomeye.org/searchResult?q="${encodeURI(params.selectionText)}"`});
    }
});

// 右键vt搜索
chrome.contextMenus.create({
    id: "VirusTotal",
    title: "使用 VirusTotal 搜索 '%s'",
    contexts: ['selection'], // 只有当选中文字时才会出现此右键菜单
    onclick: function(params){
        chrome.tabs.create({url: `https://www.virustotal.com/gui/search/${params.selectionText}`});
    }
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
    getAPIData(message,sendResponse);
    return true;
});
