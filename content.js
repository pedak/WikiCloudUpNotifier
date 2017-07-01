// FactCheck
// v0.1
// Peter Kalchgruber
// University of Vienna


// Source: http://stackoverflow.com/questions/23822170/getting-unique-clientid-from-chrome-extension
function getRandomToken() {
    /*
    create a random token for the user
    token is later saved in browser storage
    */
    var randomPool = new Uint8Array(32);
    crypto.getRandomValues(randomPool);
    var hex = '';
    for (var i = 0; i < randomPool.length; ++i) {
        hex += randomPool[i].toString(16);
    }
    return hex;
}




function bootstrap(){
    /*
    create userid if not available and store to browser
    and start strucdata process
    */
    chrome.storage.sync.get({server: 'https://fcheck.mminf.univie.ac.at', userid: null, disabled: null, debug: null}, function(items){
        var userid = items.userid;
        var server = items.server+"/get";
        var disabled = items.disabled;
        var debug = items.debug;
        if (debug){
            server = "https://localhost:8090/get";
        }
        if (!disabled){
            if (userid) {
                processStrucData(userid, server);
            } else {
                userid = getRandomToken();
                chrome.storage.sync.set({userid: userid}, function() {
                    processStrucData(userid, server);
                });
            }
        }
    });
}



function processStrucData(userid, server){
    /*
    process structured data
    */
    jsondata = getJSONdata();

    microdata = converter.convert();

    if (microdata !== null && jsondata.length !== 0){
        $.each(jsondata, function(){
            //if (this['@context'] == microdata['@context']){ /normalize url missing TODO
            if ('@graph' in microdata){
                microdata['@graph'].push(this);
            }else{
                newmd = {};
                newmd['@context'] = microdata['@context'];
                newmd['@graph'] = [];
                delete microdata['@context'];
                newmd['@graph'].push (microdata);
                newmd['@graph'].push(this);
                microdata = newmd;
            }
            //}
        });
        data = microdata
    }else if(microdata == null){
        data = jsondata;
    }else if(jsondata.length == 0){
        data = microdata;
    }
    
   
    if (data !== null){
        $.ajax({
            method: "POST",
            dataType: "json",
            url: server,
            data: JSON.stringify({ data: data, source : window.location.href, userid: userid })
        })
        .done(function( data ) {
            chrome.extension.sendMessage({ type: 'getTabId' }, function(res) {
                tabId = res.tabId;
                obj = {};
                obj[tabId + 'resultsets'] = data;
                chrome.storage.local.set(obj);
                // chrome.runtime.sendMessage({mode: "setresults", results: data}, function(response){
                //     console.log(response);
                // });
                totalnums = {eqfacts:0, conffacts:0, newfacts:0, missingfacts:0};
                if (data.status){
                    console.log("no equals found");
                }else{
                    $.each(data, function(index, val){ //for each resultset. num resultssets = num equal resources
                        totalnums.eqfacts += Object.keys(val.equals).length;
                        totalnums.conffacts += Object.keys(val.conflicting).length;
                        totalnums.newfacts += Object.keys(val.new).length;
                        totalnums.missingfacts += Object.keys(val.missing).length;

                    });
                    obj={};
                    obj[tabId+'totalnums'] = totalnums;
                    chrome.storage.local.set(obj);
                    chrome.extension.sendMessage("enable_icon");
                }
            });
        })
        .fail(function(data){
            console.log("Some error occured! " + data.statusText);
            console.log(data);
        });
    }else{
        console.log("no data found. I will rest for a while!");
    }
}

function getJSONdata(){
    /*
    parse all JSON-LD data of current page
    */
    result = []
    rawdata = ($('script[type="application/ld+json"'));
    $.each(rawdata, function(){
        result.push(jQuery.parseJSON(rawdata.html()))
    })
    return result;
}


bootstrap();





