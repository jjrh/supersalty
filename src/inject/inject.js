/* set everything up - I guess this is the document.ready of extensions..... */
chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	    if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		// This part of the script triggers when page is done loading
		console.log("inject.js is getting run");
		inject_custom_code();     // sets up the listener for the message and injects code into page.

		setInterval(better,better_interval); // setup the better listener
		// ----------------------------------------------------------
	}
	}, 10);
});

var last_message = "";  /* string of the last json message received */
var page_data = null;   /* json representation of the pages useful variables */
var changed = false;   /* if things have changed we should do something */

var bet_count = 0;    /* how many times we have betted */
var betted=false;     /* have we already betted this turn? */

var bet_states = { "1":"Player 1 wins! Payouts to Team Red.",
		   "2":"Player 2 wins! Payouts to Team Red.",
		   "locked":"Bets are locked until the next match.",
		   "open":"Bets are OPEN!"
		 };

var better_interval = 100;
var message_send_interval = 1000;

/************************************************************************************************ */
/* get_page_vars_injected()                                                                       */
/* description: function which gets injected into the html, is responsible for sending the local  */
/*              page variables back to the extension                                              */
/************************************************************************************************ */
function get_page_vars_injected(){
    /*PAGE_VARIABLES:

      var betstate;
      var x;
      var p1n;                        player1 name, currently (2013-08-21) just "player1"
      var p2n;                        ""
      var p1te;                       total bet for player 1, in readable form (10,000)
      var p2te;                       ""
      var p1to;                       total bet for player 1  in integer format (10000)
      var p2to;                       ""
      var alert;                      ????
      var balance = $("#b").val();    balance
      var u = $("#u").val();          ???? "171103" whats this?
      var _data;                      ???? returned from ajax call?

      these are delared in the src, but don't appear to be global? -- they are only set once we have bet....

      var lastWager                   What we last betted
      var lastPlayer                  Who I bet on.
      var odds                        odds html form
    */

    /* we create an interval to constantly send data back to the plugin. */
    setInterval(function(){
	var var_json = {
	    "betstate":betstate,
	    "x":x,
	    "p1n":p1n,
	    "p2n":p2n,
	    "p2te":p2te,
	    "p1to":p1to,
	    "p2to":p2to,
	    "balance":balance,
	    "u":u,
	    "_data":_data
	}

	var json_string = JSON.stringify(var_json); /* turn json into string for sending */

	try{
	    window.postMessage({ type: "FROM_PAGE", text: json_string }, "*");
	} catch(e){
	    console.log("error from injected function");
	}

    },100); // end setInterval


} /* end get_page_vars_injected */

function inject_custom_code(){

    /* INJECTED CODE */
    var script = document.createElement("script");
    script.textContent = get_page_vars_injected.toString() + "; get_page_vars_injected();";
    /* reference:  https://groups.google.com/a/chromium.org/forum/#!topic/chromium-extensions/O0DCIx0HkNY */

    document.documentElement.appendChild(script);
    var port = chrome.runtime.connect();

    /* Add a message receieve listener */
    /* reference: http://developer.chrome.com/extensions/content_scripts.html */
    window.addEventListener("message", function(event) {
	// We only accept messages from ourselves
	try{
	if (event.source != window){
	    return;
	}
	} catch(e){ console.log(e); }

	try{
	if (event.data.type && (event.data.type == "FROM_PAGE")) {
	    var data = event.data.text;
	    if(last_message != data){
		last_message = data;
		page_data = JSON.parse(data);
		changed = true;
		// console.log(data); // done elsewhere when the changed == true
	    }
	    port.postMessage(event.data.text); // not totally sure what this does.  - sends back a confirmation?
	}
	} catch(e){  }// totally shit a brick here.... 'Port: Could not establish connection. Receiving end does not exist.' not sure the fix.

    }, false);

}

function better(){
    if(changed){ changed=false; } else{	return } // Nothing has changed so do nothing.

    // k stuff has changed so lets do something
    try{ console.log(page_data); } catch(e){ } // writes the page_data.

    try{
	betstate = page_data["betstate"];
	if(betstate == "locked"){
	    console.log("locked...:", bet_states[betstate]);
	}
	else if(betstate == "open"){
	    console.log("locked...:", bet_states[betstate]);
	}
	else if(betstate == "1"){
    	    console.log("player1 payed out", bet_states[betstate]);
	}
	else if(betstate == "1"){
	    console.log("player2 payed out:",bet_states[betstate]);
	}
	else{
	    console.log("unsure of state:", betstate);
	}
    } catch(e){
	// eh try probably isn't actually needed here, but might be handy
	console.log("from better():", e);
    }

}
