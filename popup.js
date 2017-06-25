// FactCheck
// v0.1
// Peter Kalchgruber
// University of Vienna


$(function(){
    var query = { active: true, currentWindow: true };
    chrome.tabs.query(query, setBoxes);
    chrome.storage.sync.get({userid: null, server: null}, function(items){
        userid = items.userid;
        server = items.server;
    });
   
});

function setBoxes(tabs){
    /*
    write the content of the the popup windows (overview and detail)
    */
    setDetailBox(tabs[0].id);
    setOverviewBox(tabs[0].id);
    setEvents(tabs[0].url);

}


function setDetailBox(tabid){
    /*
    set content of detail boxes
    */

    var sid = tabid+'resultsets';
    var sortres = {"conflicting":{}, "new":{}, "missing":{}, "equal":{}};
    var remotesites = {};
    var pm = {};
    chrome.storage.local.get(sid, function (response) {
        response = response[sid];
        $.each(response,function(remotesiteindex, result){
            remotesites[remotesiteindex] = result.exturl;
            pm = result.pm;
            createResult(result.conflicting, remotesiteindex, sortres.conflicting);
            createResult(result.new, remotesiteindex, sortres.new);
            createResult(result.missing, remotesiteindex, sortres.missing);
            createResult(result.equals, remotesiteindex, sortres.equal);
        });
        //chrome.extension.sendMessage({res: sortres, pm: pm, remotesites: remotesites});
        printDetail(sortres,pm,remotesites);
    });
}

function createResult(partresult, remotesiteindex, rout){
    /*
    append equal/conflicting/new/missing facts to result object
    */

    $.each(partresult, function(property, subres){
        if (!(property in rout)){
            rout[property] = {};
        }
        rout[property][remotesiteindex] = subres[0];
    });
}

function printDetail(results, pm, remotesites){
    /*
    print a detailbox
    */

    $('#conflictingbox').append(printProperty(results.conflicting, pm, remotesites, "conflicting"));
    $('#missingbox').append(printProperty(results.missing, pm, remotesites, "missing"));
    $('#newbox').append(printProperty(results.new, pm, remotesites, "new"));
    $('#equalsbox').append(printProperty(results.equal, pm, remotesites, "equal"));
    return div;
}



function changeWindow(type){
    /*
    change window from info-screen to detail screen
    */
    $('#details').show();
    $('#details #header').removeClass("hequals hmissing hnew hconflicting");
    $('#details #header').addClass("h"+type);
    $('.lheader').hide();
    $('#l'+type).show();
    $('.tab').hide();
    $('#'+type).show();
}


function setOverviewBox(tabid){
    /*
    set content of overview box
    */

    var sid = tabid + 'totalnums';
    chrome.storage.local.get(sid, function (response) {
        result = response[sid];
        $('#numeqfacts').html(result.eqfacts);
        if(result.eqfacts > 0){
            $('#numeqfacts').addClass("pointer");
            $("#numeqfacts").click(function(){
                changeWindow("equals");
            });
        }
        $('#numconffacts').html(result.conffacts);
        if(result.conffacts > 0){
            $('#numconffacts').addClass("pointer");
            $("#numconffacts").click(function(){
                changeWindow("conflicting");
            });
        }
        $('#numnewfacts').html(result.newfacts);
        if(result.newfacts > 0){
            $('#numnewfacts').addClass("pointer");
            $("#numnewfacts").click(function(){
                changeWindow("new");
            });
        }
        $('#nummissingfacts').html(result.missingfacts);
        if(result.missingfacts > 0){
            $('#nummissingfacts').addClass("pointer");
            $("#nummissingfacts").click(function(){
                changeWindow("missing");
            });
        }
    });
}




function setEvents(url){
    /*
    set click events for buttons
    e.g. create ajax query to create event for dismiss, report, conflicting buttons
    */
     $('#back').click(function(){
        $('#details').hide();
        $('#notbox').show();
    });

    $('#settingsbtn').click(function(){
        console.log("open settings dialog");
    });

    $(document).on("click",".btn-xs",function(){
        var ftype = null;
        text = $(this).parent().parent().parent().parent().parent().parent().attr("id");
        if (text== "equals"){
            ftype = "EQ";
        }else if(text == "missing"){
            ftype = "MI";
        }else if(text == "conflicting"){
            ftype = "CO";
        }else if(text == "new"){
            ftype = "NE";
        }

        var action = null;
        text = $.trim($(this).text());
        if (text== "Notify"){
            action = "NO";
        }else if(text == "Dismiss"){
            action = "DI";
            if ((action == "CO" && $(this).parent().parent().parent().children("div:visible").length <= 5) ||
              ((action == "NE") || action == "MI") &&
              $(this).parent().parent().parent().children("div:visible").length <= 3) {//} && $(this).parent().parent().parent().children(':nth-child(2)').children(':first-child').children(':first-child').text() == "LOCAL"){
                $(this).parent().parent().parent().hide();
            }else{
                $(this).parent().parent().prev().hide();
                $(this).parent().parent().hide();
            }
        }else if(text == "Conflict"){
            action = "CO";
        }

        remote_url = $(this).parent().parent().prev().children(':first-child').children(':first-child').children(':first-child').attr("title");
        data = {
            "base_url": url,
            "predicate": $(this).parent().parent().parent().children(':first-child').children(':first-child').children(':first-child').html(),
            "userid": userid,
            "ftype": ftype,
            "remote_url": remote_url,
            "action": action
        };
        button = $(this);
        serverlink = server.substr(server.indexOf("//")+2);
        if (serverlink.indexOf(":")>0){
            serverlink = serverlink.substr(0,serverlink.indexOf(":"));
        }
        if(!$(this).hasClass("disabled")){
            $.ajax({
                url: "http://" + serverlink + ":8080/entry/",
                data: JSON.stringify(data),
                method: "post",
                //processData: false,
               // contentType: "application/json"
            }).done(function(){
                $(button).addClass('disabled');
                 console.log("message sent. entry saved");
            }).fail(function(){
                 console.log("error on saving message");
            });
        }
    });
}

function formatObject(value){
    /*
    if the passed object is an object it will be stringified and returned otherwise value will be returned raw
    */
    if (typeof(value) =="object"){
        strobj = JSON.stringify(value, null, '\t').replace(/\n/g,'<br />').replace(/\t/g,'&nbsp;&nbsp;&nbsp;');
        strobj = JSON.stringify(value, null, 2);
        strobj = strobj.substr(1,strobj.length-2);
        return '<pre class="object">' + strobj + '</pre>';
    }
    return value;
}

function printValue(value){
    /*
    returns a printable formated output of the passed value
    */
    if (Array.isArray(value) && value.length>1){
        sl = $("<ul></ul>");
        $.each(value, function(index, row){
            sl.append("<li>"+formatObject(row)+"</li>");
        });
        return sl;
    }
    else if(Array.isArray(value) && value.length == 1){
        return formatObject(value[0]);
    }else{
        return formatObject(value);
    }
}



function formatSource(source){
    if (source.indexOf("://" > -1)){ // normal url
        pattern = new RegExp("^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/\n]+)");
        return pattern.exec(source)[1].substr(0,4).toUpperCase();
    }
}



function printProperty(result, pm, remotesites, mode=null){
    div = $('<div class="detail">');
    //console.dir(result);
    $.each(result, function(property, value){
        pdiv = $('<div class="property">');
        row = $('<div class="row">');
        col = $('<div class="col-xs12"></div>');
        col.append('<span class="label label-primary">' + property + '</span>');
        pmval = pm[property]? pm[property] : undefined;
        col.append('<span class="label label-info"><a href="http://fcheck.mminf.univie.ac.at:8080/precisionmetric/' + pmval + '" target="_blank">' + pmval + '</a></span>');
        row.append(col);
        pdiv.append(row);

        //print base values for equal and conflicting properties to allow easier comparison of remotevalues with basevalues
        if (mode == "equal" || mode == "conflicting"){
            $.each(value, function(i,v){
                sourcelink = $('<div class="col-xs-1">').append($('<span class="label label-default">').append("LOCAL"));
                row = $('<div class="row">');
                row.append(sourcelink);
                   row.append('<div class="pvalue col-xs-11">' + formatObject(v[0]) + '</div>');
                pdiv.append(row);
                return false;
            });
        }
        $.each(value, function(i,v){

            exturl = remotesites[i];
            var domain = formatSource(exturl);
            var sourcelink = $('<a>',{
                href: exturl,
                text: domain,
                title: exturl,
            });
            sourcelink = $('<div class="col-xs-1">').append($('<span class="label label-default">').append(sourcelink));
            row = $('<div class="row">');
            row.append(sourcelink);
            if (mode == "equal" || mode == "conflicting"){
                row.append('<div class="pvalue col-xs-11">' + formatObject(v[1]) + '</div>');
            }else{
                row.append('<div class="pvalue col-xs-11">' + formatObject(v) + '</div>');
            }
            pdiv.append(row);
            row = $('<div class="row" style="margin-bottom:15px">');
            pdiv.append(row);
            row.append(getButtons(mode));
            pdiv.append(row);
        });
        div.append(pdiv);
     });
    return div;
}

function getButtons(mode){
    if (mode=="equal"){
        return $([
            '<div class="btn-group col-xs-12">',
                '<button type="button" class="btn btn-danger btn-xs">',
                    '<span class="glyphicon glyphicon-bullhorn"></span> Conflict',
                '</button>',
            '</div>'
            ].join("\n"));
    }else if(mode=="conflicting"){
        return $([
            '<div class="btn-group col-xs-12">',
                '<button type="button" class="btn btn-warning btn-xs">',
                    '<span class="glyphicon glyphicon-envelope"></span> Notify',
                '</button>',
                '<button type="button" class="btn btn-success btn-xs">',
                    '<span class="glyphicon glyphicon-volume-off"></span> Dismiss',
                '</button>',
            '</div>'
            ].join("\n"));
      
    }else if(mode=="new"){

        return $([
            '<div class="btn-group col-xs-12">',
                '<button type="button" class="btn btn-warning btn-xs">',
                    '<span class="glyphicon glyphicon-envelope"></span> Notify',
                '</button>',
                '<button type="button" class="btn btn-success btn-xs">',
                    '<span class="glyphicon glyphicon-volume-off"></span> Dismiss',
                '</button>',
            '</div>'
            ].join("\n"));
    }else{
        return $([
            '<div class="btn-group col-xs-12">',
                '<button type="button" class="btn btn-warning btn-xs">',
                    '<span class="glyphicon glyphicon-envelope"></span> Notify',
                '</button>',
                '<button type="button" class="btn btn-success btn-xs">',
                    '<span class="glyphicon glyphicon-volume-off"></span> Dismiss',
                '</button>',
            '</div>'
            ].join("\n"));
    }
}

