// FactCheck
// v0.1
// Peter Kalchgruber
// University of Vienna



function getfacts(tabs){
    var tabid = tabs[0].id;
    fillDetails(tabid);
    var sid = tabid + 'totalnums';
    chrome.storage.local.get(sid, function (response) {
        result = response[sid];
        $('#numeqfacts').html(result.eqfacts);

        if(result.eqfacts > 0){
            $("#numeqfacts").click(function(){
                $('#details').show();
                $('#details #header').removeClass();
                $('#details #header').addClass("hequals");
                $('.lheader').hide();
                $('#lequals').show();
                $('.tab').hide();
                $('#equals').show();
            });
        }
        $('#numconffacts').html(result.conffacts);
        if(result.conffacts > 0){
            $("#numconffacts").click(function(){
                $('#details').show();
                $('#details #header').removeClass();
                $('#details #header').addClass("hconflicting");
                $('.lheader').hide();
                $('#lconflicting').show();
                $('.tab').hide();
                $('#conflicting').show();
            });
        }
        $('#numnewfacts').html(result.newfacts);
        if(result.newfacts > 0){
            $("#numnewfacts").click(function(){
                $('#details').show();
                $('#details #header').removeClass();
                $('#details #header').addClass("hnew");
                $('.lheader').hide();
                $('#lnew').show();
                $('.tab').hide();
                $('#new').show();
            });
        }
        $('#nummissingfacts').html(result.missingfacts);
        if(result.missingfacts > 0){
            $("#nummissingfacts").click(function(){
                $('#details').show();
                $('#details #header').removeClass();
                $('#details #header').addClass("hmissing");
                $('.lheader').hide();
                $('#lmissing').show();
                $('.tab').hide();
                $('#missing').show();
            });
        }
    });
}


function printDetail(resultdata, exturl, action){
    if (resultdata.length === 0){
        return "";
    }
    div = $('<div class="detail">');
    var domain = "";

    if (exturl.indexOf(":///") > -1){ // = local file
        parts = exturl.split("/");
        domain = parts[parts.length-1].split(".")[0];
    }else if (exturl.indexOf("://" > -1)){ // normal url
        pattern = new RegExp("^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/\n]+)");
        domain = pattern.exec(exturl)[1];
    }else{
        domain = exturl.split("/")[0];
    }

    var sourcelink = $('<a>',{
        href: exturl,
        text: domain,
        title: exturl
    });
    
    div.append('<b>Source:</b> ');
    div.append(sourcelink);
    list = $('<table class="resultlist">');
    editbutton = '<button type="button" class="btn btn-info btn-xs info"><span class="glyphicon glyphicon-pencil"></span> Edit</button>';
    confbuttons = '<tr><td colspan="2" style="white-space: nowrap;height:60px"><button type="button" class="btn btn-success btn-xs dismissbtn"><span class="glyphicon glyphicon-ok"></span> Dismiss</button>&nbsp;'+editbutton+'&nbsp;<button type="button" class="btn btn-warning btn-xs"><span class="glyphicon glyphicon-comment"></span>&nbsp;Notify</button></td></tr>';
    addbutton = '<tr><td colspan="2" style="white-space: nowrap;height:60px"><button type="button" class="btn btn-info btn-xs dismissbtn"><span class="glyphicon glyphicon-plus"></span> Add</button></td></tr>';
    notifybutton = '<tr><td colspan="2" style="white-space: nowrap;height:60px"><button type="button" class="btn btn-warning btn-xs"><span class="glyphicon glyphicon-comment"></span>&nbsp;Notify</button></td></tr>';
    $.each(resultdata, function(i,val){
        if (action == "conffacts"){
            list.append('<tr><td><span class="label label-primary">' + i + '</span></td>' + '<td><span class="label label-default">Local:</span> ' + val[0][0] + '<br><span class="label label-default">Remote:</span> ' + val[0][1] + '</td></tr>');
            list.append(confbuttons);
        }else if(action == "newfacts"){
            out = val[0];
            if (typeof(val[0])=="object"){
                out = JSON.stringify(val[0], null, '\t').replace(/\n/g,'<br />').replace(/\t/g,'&nbsp;&nbsp;&nbsp;');;
            }
            list.append('<tr><td><span class="label label-primary">' + i + '</span></td>' + '<td>' + out + '</td></tr>');
            list.append(addbutton);
        }else if(action == "missingfacts"){
            out = val[0];
            if (typeof(val[0])=="object"){
                out = JSON.stringify(val[0], null, '\t');
            }
            list.append('<tr><td><span class="label label-primary">' + i + '</span></td>' + '<td>' + out + '</td></tr>');
            list.append(notifybutton);
        }
        else if(false && val[1].indexOf("kg:/") === 0){
            list.append('<tr><td><span class="label label-primary">' + val[0] + '</span></td>' + '<td><a href="https://www.google.com/trends/explore?q=%2F' + val[1].substr(4) + '">' + val[1] + '</a></td></tr>');
        }else{
            list.append('<tr><td><span class="label label-primary">' + i + '</span></td>' + '<td>' + val[0] + '</td></tr>');
        }
    });
    $(div).on('click', 'a', function(){
        chrome.tabs.create({url: $(this).attr('href')});
     return false;
    });
    $('body').on('click', '.dismissbtn', function () {
        $(this).parent().parent().prev().hide();
        $(this).parent().parent().hide();
    });
    
    div.append(list);
    return div;
}

function fillDetails(tabid){
    var sid = tabid+'resultsets';
    chrome.storage.local.get(sid, function (response) {
        console.dir(response);
        response = response[sid];
        $.each(response,function(index, result){
            if (Object.keys(result.equals).length>0){
                $('#equalsbox').append(printDetail(result.equals, result.exturl, 0));
            }
            if (Object.keys(result.missing).length>0){
                $('#missingbox').append(printDetail(result.missing, result.exturl, "missingfacts"));
            }
            if (Object.keys(result.new).length>0){
                $('#newbox').append(printDetail(result.new, result.exturl, "newfacts"));
            }
            if (Object.keys(result.conflicting).length>0){
                $('#conflictingbox').append(printDetail(result.conflicting, result.exturl, "conffacts"));
            }

        });
        
    });
    
}
//get();
$(function(){
    $("#notbox").append('<a href="#" title="equivalent facts"><div id="numeqfacts" class="notnum">-</div></a>');
    $("#notbox").append('<a href="#" title="conflicting facts"><div id="numconffacts" class="notnum">-</div></a>');
    $("#notbox").append('<a href="#" title="new facts"><div id="numnewfacts" class="notnum">-</div></a>');
    $("#notbox").append('<a href="#" title="remote missing facts"><div id="nummissingfacts" class="notnum">-</div></a>');
    $('#back').click(function(){
        $('#details').hide();
        $('#notbox').show();
    });
    $('#settingsbtn').click(function(){
        console.log("open settings dialog");
    });
   

    


});
window.onload = function() {
    var query = { active: true, currentWindow: true };
    chrome.tabs.query(query, getfacts);
};

