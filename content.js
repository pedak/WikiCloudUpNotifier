// ProFuse Wikipedia Adapter 
// v2.01
// Peter Kalchgruber
// University of Vienna

bootstrap();
var equals = {};

function bootstrap(){
	// injects html div and infobar into webpage
	var imgURL  =  chrome.extension.getURL("ajax-loader.gif");
	$('<div id = "ticker"></div>').insertBefore('#siteSub');
	$('#ticker').append('<img id = "ajaxloader" src = "'+imgURL+'	"/>');
	$('#ticker').append('<div id = "pfajax"><span id = "numpend">0</span> pending requests</div>');
	$('#ticker').append('<span id = "pfinfo"><ul id="infolist"><li id="liupdates">No Updates</li><li id="liequals">No equals</li></ul></span>');
	$('<div id = "pfdetail"></div>').insertBefore('#mw-content-text');
	$('#pfdetail').append('<span id="loading">Loading...</span><div id="resultsdiv"><div id="updatesdiv"><h3>Updates<button style="href = "#" id = "dismissbtn" style="display:none">Solved</button></h3><ul id="updates"><li id="noupdates">No Updates</li></ul></div><div id="equalsdiv"><h3>Equals</h3><ul id="equals"><li id="noequals">No Equals</li></ul></div></div>');
	$(document).on("click", ".showdiff", function() {
		$(this).next().slideToggle();
		$(this).text($(this).text() == 'show diff' ? 'hide diff' : 'show diff');
	});
	$(document).on("click", ".showsd", function() {
		var id = $(this	).attr('id').replace(/showsd/, '');
		$("#sd"+id).slideToggle();
		$(this).text($(this).text() == 'show structured data' ? 'hide structured data' : 'show structured data');
	});
	start();
}

function extractResource(url){
	//extract Wikipedia-Article of URL
	match  =  url.match("([a-zA-Z_,.-]*)#*$");
	resource  =  match[1];
	if (match.length !=  2){
		console.log("something went wrong, could not extract resource of url");
		throw("something went wrong, could not extract resource out of url");
	}
	return resource;
}

function start(){
		
	resource = extractResource(document.URL);
	rURL = "http://localhost:8080/get?article="+resource;

	//if resource timestamp of last update exists in local storage add timestamp to request URL
	if(localStorage[resource]){
		rURL += "&last="+localStorage[resource];
	}
	
	console.log("Searching equals @: ",rURL);
	
	//rURL = "http://kalchgruber.com/test.xml";
	
	$.ajax({
		type: "GET",
		url: rURL,
		dataType: "xml",
	}).done(function( data ) {
		//updateFE(data)
		console.log("get?article request done");
		updatePendingTicker();
	})
    .fail(function( jqxhr, textStatus, error ) {
		var err  =  textStatus + ", " + error;
		console.log("Get Request Failed: " + err );
	});
	
	updatePendingTicker();

}
///Source http://stackoverflow.com/questions/1219860/html-encoding-in-javascript-jquery
function htmlEncode(value){
  //create a in-memory div, set it's inner text(which jQuery automatically encodes)
  //then grab the encoded contents back out.  The div never exists on the page.
  return $('<div/>').text(value).html();
}


function dismiss(timestamp){
	// updates localstorage to new data length
	// removes url of equals dictionary

	resource = extractResource(document.URL);
	localStorage[resource]  =  timestamp;
	$("#liupdates").text("No Updates found!").off('click');
	$("#updates").html("");
	$("#updates").append("<li>No updates found</li>");
	$("#pfdetail").slideUp();
	$("#dismissbtn").hide();
	$('#noupdates').show();
	$('#ticker').removeClass("pointer");
}
 
function extractSD(data,id){
	innerdata ="";
	$(data).children().each(function(index){
		innerdata += this.nodeName + ": " + $(this).text() + "<br>";
	});
	if ($(data).children().length > 0){
		sd = [];
		sd[0] = ' <button class = "showsd" id = "showsd' + id + '">show structured data</button>';
		sd[1] = '<div id = "sd' + id + '" style = "display:none" class="ml10"><span class="label">Structured data extracted:</span><br>' + innerdata + '</div>';
		return sd;
	}
	return new Array("","");
}

function updateFE(data){

	//updates the frontend (2 divs: pfinfo, pfdetail)
	console.log("updating frontend");
	
	//converting xml to jquery object
	$xml  =  $( data );
	num_ds = 0;
	num_ds_completed = 0;
	$xml.find('datasource').each(function(dsindex){
		num_ds += 1;
		$datasource = $(this);
		timestamp = $(this).attr('timestamp');
        domain  = $(this).attr('domain');
        complete = $(this).attr('complete');
        resource = extractResource(document.URL);
        
        $("#dismissbtn").on("click", function(){ dismiss(timestamp);});
        if(!localStorage[resource]){
			dismiss(timestamp);
			console.log("no stamp found dismissed");
		}
        //convert domainid to valid DOM object id
        domainid = domain.replace(/\./g, "_");
		
		//count completed datasources for ticker
		if (complete == "yes"){
			num_ds_completed += 1;
		}
        //check if element with domain id (li-element) exists, only append if does not exist already
		if (complete == "yes" && $('#' + domainid).length === 0){
			if (localStorage[resource]>0 && localStorage[resource] !=  timestamp){
				if ($(this).attr('diff') == "yes"){
					console.log("Update @:  " + domain);
					
					$datasource.find('resource').each(function(rindex){
						if ($(this).attr('duplicate')=="no" && $(this).attr('update')=="yes"){
							url = $(this).attr('url');
							diff = "No Diff could be computed";
							if ($(this).attr('diffbody') && $(this).attr('diffbody').length > 0){
								graphdiff = false;
								diffvalue = htmlEncode($(this).attr('diffbody'));
								if (diffvalue.search("SEPARATOR") > 0){
									diffvalue = diffvalue.replace("||SEPARATOR||",'</span><span style="color:green">'); //separate old and new diff
									graphdiff = true;
								}
								if (graphdiff){
									diffvalue = '<span style="color:red">' + diffvalue + "</span>";
								}else{
									difflines = diffvalue.split("\n");
									output = "";
									$.each(difflines, function(n, line) {
										if (line.indexOf("@") === 0){
											output += '<div style="color:grey">' + line + '</div>';
										}else if (line.indexOf("+") === 0){
											output += '<div style="color:green">' + line + '</div>';
										}else if (line.indexOf("-") === 0){
											output += '<div style="color:red">' + line + '</div>';
										}
									});
									diffvalue = output;
								}
								diff = ' <button class = "showdiff">show diff</button>';
								diff += '<div class="ml10" style = "display:none"><span class="label">Diff between last accepted version and newest version:</span><br>'+diffvalue+'</div>';
								diff = diff.replace(/\n/g, "<br>");
							}
							sd = extractSD($(this).find('data'),"u%s_%s" % (dsindex,rindex));
							row  = '<li id="' + domainid + '"><a target = "_blank" href = "' + url + '">' + url + '</a>' + sd[0] + diff + sd[1] + '</li>';
							$("#updates").append(row);
						}
					});
				}
			}
			console.log("Equals or first time fetched: " + domain);
			
			$datasource.find('resource').each(function(rindex){
				if ($(this).attr('duplicate') == "no"){
					url = $(this).attr('url');
					sd = extractSD($(this).find('data'),"e"+dsindex+"_"+rindex);
					row  = '<li id="' + domainid + '"><a target = "_blank" href = "' + url + '">' + url + '</a>' + sd[0]+sd[1] + '</li>';
					$("#equals").append(row);
				}
			});
		}
		setCounter();
    });

	// setting update/equals ticker
	output = "0 of ?";
	if (num_ds>0){ //if return value is integer
		output = (num_ds-num_ds_completed) + " of " + num_ds;
	}
	$('#numpend').text(output);
	if(num_ds_completed<num_ds || num_ds === 0){ //if no datasources fetched, wait
		$('#ajaxloader').css("display","inline");
		console.log("recalling ajax call");
		setTimeout(function(){
			updatePendingTicker();
		}, (5000));
	}else{
		$('#ajaxloader').hide();
		$('#pfajax').hide();
	}
}

function setCounter(){
	$('#loading').hide();
	var s = '';
    var subject = "equal";
  
    numupdates = $('#updates li').size()-1;
    numequals = $('#equals li').size()-1;
    if (numupdates>0){
        subject = "update";
		$('#noupdates').hide();
		$('#dismissbtn').show();
    }
    if (numequals>0){
		$('#noequals').hide();
    }
    
    $('#pfinfo').off(); //remove toggleevent

	if (numupdates == 1){
		$("#liupdates").text("One update found!");
	}
	if (numequals == 1){
		$("#liequals").text("One equal found!");
	}
	if(numupdates === 0){
		$("#liupdates").text("No updates found!");
	}
	if(numequals === 0){
		$("#liequals").text("No equals found!");
	}
	if(numupdates === 0 && numequals === 0){
		$("#pfinfo").off("click"); //remove click handler
		$("#pfdetail").slideUp();
		$('#ticker').removeClass("pointer");
	}else{
		$("#pfinfo").click(function(){$('#pfdetail').slideToggle();});
	}
	if (numupdates>1){
		$("#liupdates").text(numupdates+" updates found!").click(function(){$('#pfdetail');});
	}
	if (numequals>1){
		$("#liequals").text(numequals+" equals found!").click(function(){$('#pfdetail');});
	}
}

function updatePendingTicker(){
	
	resource = extractResource(document.URL);
	rURL = "http://localhost:8080/live?article="+resource;

	//if resource timestamp of last update exists in local storage add timestamp to request URL
	if(localStorage[resource]){
		rURL += "&last=" + localStorage[resource];
	}
	
	$.ajax({
		type: "GET",
		url: rURL,
		dataType: "xml",
	}).done(function( data ) {
		updateFE(data);
	})
    .fail(function( jqxhr, textStatus, error ) {
		var err  =  textStatus + ", " + error;
		console.log( "Live Request Failed2: " + err );
	});
}






