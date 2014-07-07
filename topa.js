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
					// Make sure the node has a hash link for IE8
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
	ns.function_add_child = function(ev) {
		// Don't let the browser handle the event
		ev.preventDefault();
		// Wrap 'this' and inject data from the URI
		var $this = ns.parseQueryString($(this));
		
		ns.spLoad(ns.lists.getByTitle($this.attr("list"))).then(function(list) {
			var url = ns.template("{url}?{child_column}={ID}", $.extend($this, {
				url: list.get_defaultNewFormUrl(),
			}));
			
			// Monitor for the iFrame that we're going to show later
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
	// function_bulk_add
	// --------------------------------------------------
	ns.function_bulk_add = function(ev) {
		// Don't let the browser handle the event
		ev.preventDefault();
		// Wrap 'this' and parse URI 
		var $this = ns.parseQueryString($(this));
		var fromList, fromItems=[], toList;
		
		// Show a loading indicator
		var $toList = $(ns.template("table[summary^='{to}']", $this))
				.parents("div[webpartid]")
				.loading();
		
		// Load the from list
		ns.spLoad(ns.lists.getByTitle($this.attr("from"))).then(function(list) {
			fromList = list;
			
			// Load the from items
			ns.spLoad(list.getItems(SP.CamlQuery.createAllItemsQuery())).then(function(items) {
				for(var it = items.getEnumerator(); it.moveNext(); ) 
					fromItems.push(it.get_current());
			});
		}).then(function() {
			ns.spLoad(ns.lists.getByTitle($this.attr("to"))).then(function(list) {
				toList = list;
				var newItems = [];
				var toItems = {};
				
				// Load the from items
				ns.spLoad(toList.getItems(SP.CamlQuery.createAllItemsQuery())).then(function(items) {
					// Create a hashmap of the items by id to track pre-existing items
					for(var it = items.getEnumerator(), item=null; it.moveNext(), item=it.get_current(); ) 
						if(item.get_item($this.attr("to-column")).get_lookupId() == $this.ID)
							toItems[item.get_item($this.attr("from-column")).get_lookupId()] = item;
					
					$(fromItems).each(function(i, item) {
						// Don't add pre-existing items
						if(toItems[item.get_id()]) return;
						var newItem = toList.addItem();
						newItem.set_item($this.attr("from-column"), item.get_id());
						newItem.set_item($this.attr("to-column"), $this.ID);
						newItem.update();
						newItems.push(newItem);
						ns.context.load(newItem);
					});
					
					ns.context.executeQueryAsync(function() {
						$toList.find("#ManualRefresh").click();
						$toList.loading("done");
					});
				});
			});
		});
	};
	
	// --------------------------------------------------
	// parseQueryString
	// --------------------------------------------------
	ns.parseQueryString = function($node) {
		$node.prop("ownerDocument").location.href.replace(/\?(.*?)=(.*?)(&|$)/g, 
			function(a,b,c) {$node[b] = c; });		
		return $node;
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
	// Promise                                    [class]
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
	
	// --------------------------------------------------
	// loading                                   [jQuery]
	// --------------------------------------------------
	$.fn.loading = function(status) {
		var $text;
		// Remove the old item
		$($.data(this, "loadingDiv")).next().show().prev().remove();
		// Create the new item
		if(!status) {
			$.data(this, "loadingDiv", $("<div>")
				.insertBefore(this.hide())
				.css({
					backgroundColor: "#BBB",
					color          : "white",
					fontSize       : "14pt",
					fontWeight     : "bold",
					textAlign      : "center",
					height         : this.height(),
				})
				.append($text = $("<div>")
					.css({paddingTop: this.height()/2})
					.text("Loading...")
				)
			);
			// Shift the text up by half height
			$text.css({paddingTop: parseInt($text.css("paddingTop"), 10) - $text.height()/2});
		}
		
		return this;
	};
	
	ns.initialize();
})("topa-extensions");
