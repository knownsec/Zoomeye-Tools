window.onload = function () {
    $("#down").hide();
    TARGET_HOST = "";
    HOST_DATA = {};
    bg = chrome.extension.getBackgroundPage();

    function assginPort(portList){
        portList=portList.sort(function(n1,n2){
           return Number(n1)-Number(n2)
        });
        for(let i=0;i<portList.length;i++){
            if(portList[i]!==''){
                porttag=`
                <li class="rcorners" text-align="center">
                    <span style='color:#66afeb;display:inline-block;height:15px;width:42px;text-align:center;'>${portList[i]}</span>
                </li>`
                $("#portlist").append(porttag);
            }
        }
    }

    function getStorageSite(sitename){
        // check data weather in storage
        chrome.storage.local.get([sitename], function(hostdata){
            if(hostdata[sitename]){
                assignData(JSON.parse(hostdata[sitename]));
            }
            else{
                chrome.runtime.sendMessage(TARGET_HOST,(res)=>{
                    if(res['error']==undefined&&(isValIP(res['ip']))){
                        assignData(res);
                        bg.saveData(TARGET_HOST,res);
                        bg.HOST_DATA={};
                    }
                    else if(!isValIP(res['ip'])){
                        $("#loading").hide();
                        let errors = `<p style="font-size: 15px; text-align: center;">IP is ${res['ip']}</p>`
                        $("#panel").append(errors);
                    }
                    else{
                        $("#loading").hide();
                        let errors = `<p style="font-size: 15px; text-align: center;">${res['error']}</p>`
                        $("#panel").append(errors);
                    }
                });
            }
        });
    }

    function assignData(data){
        $("#targetSite")[0].innerText=TARGET_HOST;
        if(data.ip instanceof Array){
            $("#ipInfo")[0].innerText=data.ip[0];
        }
        else{
            $("#ipInfo")[0].innerText=data.ip;
        }
        assginPort(data.port_list);
        if((data.city!==''&&data.city!=='Unknown')||(data.country!==''&&data.country!=='Unknown')){
            if(data.country){
                if(data.city){
                    $("#city")[0].innerText=data.country+'  '+data.city;
                }
                else{
                    $("#city")[0].innerText=data.country;
                }
            }
            else{
                $("#city")[0].innerText=data.city
            }
        }
        else{
            $("#city_id").hide();
        }
        if(data.org!==undefined&&data.org!==""){
            if(data.org.cn!==undefined){
                $("#organization")[0].innerText=data.org.cn;
            }
            else if(data.org.en!==undefined){
                $("#organization")[0].innerText=data.org.en;
            }
            else{
                $("#organization")[0].innerText=data.org;
            }
        }
        else{
            $("#org_id").hide();
        }
        if(data.isp!==undefined&&data.isp!==null&&data.isp!==""){
            if(data.isp.cn!==undefined){
                $("#ISP")[0].innerText=data.isp.cn;
            }
            else if(data.isp.en!==undefined){
                $("#ISP")[0].innerText=data.isp.en;
            }
            else{
                $("#ISP")[0].innerText=data.isp;
            }
        }
        else{
            $("#isp_id").hide();
        }
        if(TARGET_HOST.match(/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/)){
            $("#hostlink")[0].href=`https://www.zoomeye.org/searchResult?q=ip: ${TARGET_HOST}`;
        }
        else{
            $("#hostlink")[0].href=`https://www.zoomeye.org/searchResult?q=site: ${TARGET_HOST}`;
        }
        $("#loaded").show();
        $("#view").show();
        $("#loading").hide();
    }

    function isValIP(ip){
        if((ip.match(/^(127|192)\./))){
            return false;
        }
        else if(ip.match(/^(172\.(1[6-9]|2[0-9]|3[0-2]))/)){
            return false
        }
        else if(ip.match(/^10\./)){
            return false;
        }
        else{
            return true;
        }
    }

    function isValUrl(url){
        if((url.match(/^chrome:\/\/extensions/))||(url.match(/^chrome:\/\//))){
            return false;
        }
        if((url.match(/^file:/))){
            return false
        }
        else{
            return true;
        }
    }

    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
        let url = tabs[0].url;
        if(!isValUrl(url)){
            $("#down").show();
            $("#loading").hide();
            $("#loaded").hide();
            $("#view").hide();
            return;
        }
        TARGET_HOST = url.match(/^(?:http|https):\/\/(.*?)\//)[1];
        if(!isValIP(TARGET_HOST)){
            $("#down").show();
            $("#loading").hide();
            $("#loaded").hide();
            $("#view").hide();
            return;
        }
        $("#loading").show();
        $("#loaded").hide();
        $("#view").hide();
        getStorageSite(TARGET_HOST);
    });
}