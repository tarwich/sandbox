(function(NS) {
	// Initialize the namespace
	var ns = window[NS] || (window[NS] = {});
	
	try { document.addEventListener("DOMContentLoaded", ns.ready); }
	catch(ex) {
		document.attachEvent("onreadystatechange", ns.readyStateChange);
	}
	
	ns.ready = function() {
		console.log("READY"); 
	};
	
	ns.readyStateChange = function() {
		if(document.readyState == "complete") {
			document.detachEvent("onreadystatechange", ns.readyStateChange);
			ns.ready();
		}
	};
})("topa-extensions");

// (function(callback) {
// })
// (function() {
//   location.search.replace(/\??(.*?)=(.*?)(?:&|$)/g, function(a,title,newValue) {
//     var nodes = document.querySelectorAll("[title='"+title+"'");
//     for(var i=0, iMax=nodes.length; i<iMax; ++i) nodes[i].value = unescape(newValue);
//   })
// });</script>​​​​​​​​​​​​​​
