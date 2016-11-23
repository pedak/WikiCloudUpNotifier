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
                $('.tab').hide();
                $('#equals').show();
            });
        }
        $('#numconffacts').html(result.conffacts);
        if(result.conffacts > 0){
            $("#numconffacts").click(function(){
                $('#details').show();
                $('.tab').hide();
                $('#conflicting').show();
            });
        }
        $('#numnewfacts').html(result.newfacts);
        if(result.newfacts > 0){
            $("#numnewfacts").click(function(){
                $('#details').show();
                $('.tab').hide();
                $('#new').show();
            });
        }
        $('#nummissingfacts').html(result.missingfacts);
        if(result.missingfacts > 0){
            $("#nummissingfacts").click(function(){
                $('#details').show();
                $('.tab').hide();
                $('#missing').show();
            });
        }
    });
}


function printDetail(resultdata, fs2source, action){
    if (resultdata.length === 0){
        return "";
    }
    div = $('<div class="detail">');
    var domain = "";

    if (fs2source.indexOf(":///") > -1){ // = local file
        parts = fs2source.split("/");
        domain = parts[parts.length-1].split(".")[0];
    }else if (fs2source.indexOf("://" > -1)){ // normal url
        pattern = new RegExp("^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/\n]+)");
        domain = pattern.exec(fs2source)[1];
    }else{
        domain = fs2source.split("/")[0];
    }

    var sourcelink = $('<a>',{
        href: fs2source,
        text: domain,
        title: fs2source
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
            list.append('<tr><td><span class="label label-primary">' + val[0] + '</span></td>' + '<td><span class="label label-default">Local:</span> ' + val[1] + '<br><span class="label label-default">Remote:</span> ' + val[2] + '</td></tr>');
            list.append(confbuttons);
        }else if(action == "newfacts"){
            list.append('<tr><td><span class="label label-primary">' + val[0] + '</span></td>' + '<td>' + val[1] + '</td></tr>');
            list.append(addbutton);
        }else if(action == "missingfacts"){
            list.append('<tr><td><span class="label label-primary">' + val[0] + '</span></td>' + '<td>' + val[1] + '</td></tr>');
            list.append(notifybutton);
        }
        else if(false && val[1].indexOf("kg:/") === 0){
            list.append('<tr><td><span class="label label-primary">' + val[0] + '</span></td>' + '<td><a href="https://www.google.com/trends/explore?q=%2F' + val[1].substr(4) + '">' + val[1] + '</a></td></tr>');
        }else{
            list.append('<tr><td><span class="label label-primary">' + val[0] + '</span></td>' + '<td>' + val[1] + '</td></tr>');
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
        $.each(response,function(index, resultset){
            result = resultset.data;
            $('#equalsbox').append(printDetail(result.eqfacts, resultset.fs2source, 0));
            $('#missingbox').append(printDetail(result.missingfacts, resultset.fs2source, "missingfacts"));
            $('#newbox').append(printDetail(result.newfacts, resultset.fs2source, "newfacts"));
            $('#conflictingbox').append(printDetail(result.conffacts, resultset.fs2source, "conffacts"));

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

