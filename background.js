// FactCheck
// v0.1
// Peter Kalchgruber
// University of Vienna

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request == "enable_icon") {
        chrome.pageAction.show(sender.tab.id);
        sendResponse("popup icon enabled");
    }else if(request.mode == "setresults"){
        localStorage.setItem("resultsets", request.results);
        sendResponse("resultsets NOT set in bg page");
    }
    else if (request.mode == "getfacts"){
        sendResponse(localStorage.getItem("resultsets"));
        console.log(localStorage.getItem("resultsets"));
    }else if ( request.type == 'getTabId' )
    {
        console.log(sender.tab.id);
        sendResponse({ tabId: sender.tab.id });
    }
    else{
        // data = request.data;
        sendResponse();
        
        // if (request.totalnums.conffacts > 0 || request.totalnums.newfacts > 0){
        //     chrome.browserAction.setBadgeBackgroundColor({color:[208, 0, 24, 255]});
        //     chrome.browserAction.setBadgeText({
        //         text: (request.totalnums.newfacts + request.totalnums.conffacts).toString()
        //     });
        //     sendResponse("badge set");
        // }else{
        //     chrome.browserAction.setBadgeText({
        //         text: ""
        //     });
        // }
    }
});
    