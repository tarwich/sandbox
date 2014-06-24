(function(NS, init) {
	// Initialize the namespace
	ns = window[NS] || (window[NS] = {});
	
	// --------------------------------------------------
	// initialize
	// --------------------------------------------------
	ns.initialize = function() {
		// Add jQuery to the document
		if(!window["jQuery"]) document.head.appendChild(document.createElement("script")).src = "//ajax.googleapis.com/ajax/libs/jquery/1.6.0/jquery.min.js";
		
		// Wait for jQuery to be available
		ns.waitFor(function() { return window.jQuery; }).then(function($) {
			// Create a document.ready function
			$(function() {
				// Activate all a[function] nodes
				$("a[function]")
				// Remove any webparts that are being designed
				.not("body .ms-WPBorder a[function]")
				.each(function() {
					var $node = $(this);
					// Make sure the node has a pound link for IE8
					$node.attr("href", "#");
					// Change the function from foo to function_foo
					functionName = ["function_", $node.attr("function")].join("");
					// Lookup (and call) the function in our namespace
					$node.click((ns[functionName] || function() { 
						console.warn(["Function '",functionName,"' not known"].join("")); 
					}));
				});
			});
		});
	};
	
	// --------------------------------------------------
	// function_add_child
	// --------------------------------------------------
	ns.function_add_child = function() {
		var $this = $(this);
		var href = $this.prop("ownerDocument").location.href;
		
		// Get data from the URI
		href.replace(/\?(.*?)=(.*?)(&|$)/g, function(a,b,c) {$this[b] = c; });
		// Get the base url
		var baseURL = href.match(/.*?\/Lists(?=\/)/)[0];
		var url = [baseURL,"/",$this.attr("list"),"/NewForm.aspx?",$this.attr("child_column"),"=",$this.ID].join("");
		
		// Wait for the iFrame to show up
		ns.waitFor("iframe.ms-dlgFrame").then(function(node) {
			$(node).load(function() {
				var $document = $(this.contentDocument);
				// Process all the URI information for the child document
				$document.prop("location").href.replace(/\?(.*?)=(.*?)(&|$)/g, function(a, b, c) {
					// Set the value of this input element
					$document.find("[title="+b+"]").val(c)
					// Hide the input field
					.closest("tr").hide();
				});
			});
		});
		
		SP.UI.ModalDialog.showModalDialog({
			url  : url,
			title: $this.attr("caption") || "Enter child information",
			dialogReturnValueCallback: function() { 
				$("#ManualRefresh").click(); 
			},
		});
		
	};
			
	// --------------------------------------------------
	// waitFor
	// --------------------------------------------------
	// Returns a Promise of sorts for when the selector
	// is found. Selector should not be a jQuery object, 
	// because since 1.7 it's impossible to rer[]un a 
	// jQuery selector.
	ns.waitFor = function(selector) {
		var promise; promise = {
			callbacks: [],
			then: function(callback) { 
				this.callbacks.push(callback); 
				return this; 
			},
			resolve: function(payload) {
				for(var i=0, iMax=this.callbacks.length; i<iMax; ++i)
					this.callbacks[i](payload);
			},
		};
		
		// If the selector is a function, then use that function as the test
		if(typeof(selector) == "function") test = selector;
		// If the selector isn't a function, then use a function that tests a jQuery selector
		else test = function() { return jQuery(selector); };
		
		window.setTimeout(function tick() {
			var result = test();
			if(result) {
				// If this is a jQuery object, then make sure there are results
				if(result.jquery) { if(result.length) return promise.resolve(result);
				// Otherwise, a non-falsy value means success 
				} else return promise.resolve(result);
			}
			window.setTimeout(tick, 500);
		}, 1);
		return promise;
	};
	
	ns.initialize();
})("topa-extensions");
