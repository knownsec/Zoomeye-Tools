window.onload = function () {

    IS_LOGIN = false;
    TARGET_HOST = "";
    SPLIT_SYMBOL = ",";
    SPLIT_SYMBOL_WITHOUT_DOT = "\n";
    bg = chrome.extension.getBackgroundPage();

    function gethostdata(){
        var HOST_DATA = {};

        chrome.storage.local.get([bg.TARGET_HOST], function(hostdata){
            if(hostdata[bg.TARGET_HOST]){
                HOST_DATA =  JSON.parse(hostdata[bg.TARGET_HOST]);
                updatedata(HOST_DATA);
            }
        })
        return true;
    }

    function updatedata(HOST_DATA){
        console.log(HOST_DATA);
        if(HOST_DATA.hostname != bg.TARGET_HOST){
            $('.host').hide();
            $('.loading').show();
            return;
        }
        $('.loading').hide();
        $('.host').show();

        // update data
        $("#ip")[0].innerText = HOST_DATA.ip;
        $("#hostnames")[0].innerText = HOST_DATA.hostname;

        $("#country")[0].innerText = HOST_DATA.country;
        $("#port")[0].innerText = HOST_DATA.port;
        $("#protocol")[0].innerText = HOST_DATA.protocol;
        $('#hostlink')[0].href = "https://www.zoomeye.org/searchDetail?type=host&title=" + HOST_DATA.token;

        for(i=0;i<HOST_DATA.datalist.length;i++){
            index = i+1;
            newbanner = '<tr>\
                          <th scope="row">' + index + '</th>\
                          <td>' + HOST_DATA.datalist[i][0] + '</td>\
                          <td>' + HOST_DATA.datalist[i][1] + '</td>\
                        </tr>';
        
            $('#infolist').append(newbanner);
        }

    }

    function copytext(text){
        var w = document.createElement('textarea');
        w.value = text;
        document.body.appendChild(w);
        w.select();


        document.execCommand('Copy');

        w.style.display = 'none';
        return;
    }

    function list2str(slist, withoutdot){

        split_symbol = SPLIT_SYMBOL

        if (withoutdot){
            split_symbol = SPLIT_SYMBOL_WITHOUT_DOT
        }

        if (slist.length == 0){
            return ""
        }

        if (slist.length == 1){
            return slist[0]
        }
        else{
            return slist.join(split_symbol)
        }
    }

    // copy url
    $(".copy-button").click(function (){

        type = this.id;
        action = 'copydata'

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, {"types": type, "action": action}, function(response) {
                iplist = response.data;
                withoutdot = response.withoutdot;

                copytext(list2str(iplist, withoutdot));
            });
        });
        
    });

    // for host
    function checkHost(hostname){
        if (hostname == "zoomeye.org" || hostname == "www.zoomeye.org"){
            return true;
        }
        else{
            return false;
        }
    }

    function checkResult(){
        if(HOST_DATA.ip){
            return true;
        }
        else{
            return false;
        }
    }

    if (checkHost(bg.TARGET_HOST) != true){
        $('.menumain').hide();
    }
    else{
        $('.menumain').show();
    }

    // show before check
    $('.loading').show();
    $('.host').hide();    

    if (bg.checkZoomeyeLogin() == false){
        // hide host and new button

        $('.host').hide();
        $('.needlogin').show();
        $('.loading').hide();
        return;
    }
    else{
        $('.needlogin').hide();
        IS_LOGIN = true;
    }


    //get hostdata
    gethostdata();
    updatedata();
    

}