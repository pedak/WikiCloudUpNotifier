// FactCheck
// v0.1
// Peter Kalchgruber
// University of Vienna

bootstrap();
function bootstrap(){
    chrome.storage.sync.get({server: 'https://fcheck.mminf.univie.ac.at/get', userid: null}, function(items){
        var userid = items.userid;
        var server = items.server;
        if (userid) {
            processStrucData(userid, server);
        } else {
            userid = getRandomToken();
            chrome.storage.sync.set({userid: userid}, function() {
                processStrucData(userid, server);
            });
        }
    });
    //chrome.storage.local.set({'resultsets': null});
}

// Source: http://stackoverflow.com/questions/23822170/getting-unique-clientid-from-chrome-extension
function getRandomToken() {
    var randomPool = new Uint8Array(32);
    crypto.getRandomValues(randomPool);
    var hex = '';
    for (var i = 0; i < randomPool.length; ++i) {
        hex += randomPool[i].toString(16);
    }
    return hex;
}


function processStrucData(userid, server){
    microdata = getMicrodata();
    jsondata = getJSONdata();
    $.ajax({
        method: "POST",
        dataType: "json",
        url: server,
        data: JSON.stringify({ microdata: microdata, jsondata : jsondata, source : window.location.href, userid: userid })
    })
    .done(function( data ) {
        chrome.extension.sendMessage({ type: 'getTabId' }, function(res) {
            tabId = res.tabId;
            obj={};
            obj[tabId + 'resultsets'] = data;
            chrome.storage.local.set(obj);
            chrome.runtime.sendMessage({mode: "setresults", results: data}, function(response){
                console.log(response);
            });
            totalnums = {eqfacts:0, conffacts:0, newfacts:0, missingfacts:0};
            $.each(data, function(index, val){ //for each resultset. num resultssets = num equal resources
                totalnums.eqfacts += val.data.eqfacts.length;
                totalnums.conffacts += val.data.conffacts.length;
                totalnums.newfacts += val.data.newfacts.length;
                totalnums.missingfacts += val.data.missingfacts.length;
            });
            sn = tabId+'totalnums';
            var a = 'totalnums';
            obj={};
            obj[tabId+a] = totalnums;
            chrome.storage.local.set(obj);
            chrome.extension.sendMessage("enable_icon", function(response){
                console.log(response);
            });
        });
    })
    .fail(function(data){
        console.log("Some error occured! " + data.statusText);
        console.log(data);
    });
}

function getJSONdata(){
    rawdata = ($('script[type="application/ld+json"').html());
    if(rawdata){
        return jQuery.parseJSON(rawdata);
    }
    return "";
}

function getMicrodata(){
    rawdata = $('body').items();
    return rawdata.microdata(false);
}







