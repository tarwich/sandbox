(function(NS, init) {
	// Initialize the namespace
	ns = window[NS] || (window[NS] = {});
	ns.context = null; // SP.ClientContext
	ns.web     = null; // SP.Web
	ns.lists   = null; // SP.ListCollection
	
	// --------------------------------------------------
	// initialize
	// --------------------------------------------------
	ns.initialize = function() {
		// Add jQuery to the document
		if(!window["jQuery"]) document.head.appendChild(document.createElement("script")).src = "//ajax.googleapis.com/ajax/libs/jquery/1.6.0/jquery.min.js";
		// Load the ClientContext library
		SP.SOD.executeFunc("sp.js", "SP.ClientContext");
		
		// Wait for jQuery and SP.ClientContext to be available
		ns.waitFor(function() { return (window.jQuery && SP.ClientContext) ? jQuery : false; }).then(function($) {
			// Get big SharePoint objects
			ns.context = SP.ClientContext.get_current(); // context
			ns.web     = ns.context.get_web();           // web
			ns.lists   = ns.web.get_lists();             // lists
			
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
	// getList
	// --------------------------------------------------
	ns.getList = function(listID) {
		ns.context.get
	};
	
	// --------------------------------------------------
	// function_add_child
	// --------------------------------------------------
	ns.function_add_child = function() {
		var $this = $(this);
		
		// Get data from the URI
		$this.prop("ownerDocument").location.href.replace(/\?(.*?)=(.*?)(&|$)/g, 
			function(a,b,c) {$this[b] = c; });
		
		ns.spLoad(ns.lists.getByTitle($this.attr("list"))).then(function(list) {
			url = ns.template("{url}?{child_column}={id}", $.extend($this, {
				url: list.get_defaultNewFormUrl(),
				id : $this.ID,
			}));
			
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
		});
	};
	
	// --------------------------------------------------
	// spLoad
	// --------------------------------------------------
	ns.spLoad = function(thingToLoad) {
		var promise = new ns.Promise();
		
		ns.context.load(thingToLoad);
		ns.context.executeQueryAsync(function() { promise.resolve(thingToLoad); });
		
		return promise;
	};
	
	// --------------------------------------------------
	// template
	// --------------------------------------------------
	ns.template = function(text, context) {
		return text.replace(/\{(.*?)\}/g, function(a,key) {
			return context[key] || (context.attr?context.attr(key):false);
		});
	};
	
	// --------------------------------------------------
	// url
	// --------------------------------------------------
	ns.url = function(path) {
		// Memoize document.origin
		var origin = ns.origin || (ns.origin = document.location.href.split(ns.context.get_url())[0]);
		
		return [origin, path].join("");
	};
			
	// --------------------------------------------------
	// waitFor
	// --------------------------------------------------
	// Returns a Promise of sorts for when the selector
	// is found. Selector should not be a jQuery object, 
	// because since 1.7 it's impossible to rerun a 
	// jQuery selector.
	ns.waitFor = function(selector) {
		var promise = new ns.Promise();
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
	
	// --------------------------------------------------
	// Promise
	// --------------------------------------------------
	ns.Promise = (function() {
		function Promise() {
			this.callbacks = [];
			this.resolved = false;
			this.value = null;
		};
		
		Promise.as = function(value) { return new Promise().resolve(value); };
		
		Promise.prototype.resolve = function(value) {
			this.value = value;
			this.resolved = true;
			for(var i=0, iMax=this.callbacks.length; i<iMax; ++i)
				this.value = this.callbacks.pop()(this.value)||this.value;
			return this;
		};
		
		Promise.prototype.then = function(callback) {
			this.callbacks.push(callback);
			if(this.resolved) this.resolve(this.value);
			return this;
		};
		
		return Promise;
	})();
	
	ns.initialize();
})("topa-extensions");
