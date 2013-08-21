chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		// ----------------------------------------------------------
		// This part of the script triggers when page is done loading
		console.log("Hello. This message was sent from scripts/inject.js");
		// ----------------------------------------------------------
	    setInterval(better,1000);


	}
	}, 10);
});

var bet_count = 0;
var betted=false;

function better(){
    if($("#betstatus").text() == "Bets are locked until the next match." || betted==true){
	$($("ul .menu").not("a")[2]).html("BETCOUNT:"+bet_count+" time:"+new Date().getTime());
	return
    }
    else{
	$("#wager").val("10");
	bet_count++;
	betted=true;
	$($("ul .menu").not("a")[2]).html("BETCOUNT:"+bet_count+" time:"+new Date().getTime());
    }
    

//    console.log($("#betstatus").text());
}
