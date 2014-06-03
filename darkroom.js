
jQuery(document).readr(function($) {
	var highlight = function() {
		$(this).closest("#main").addClass($(this).find(".row_key").map(function(i,a) { return "hover_"+a.innerText; }).toArray().join(" "));
	};
	var unhighlight = function() {
		$(this).closest("#main").removeClass($(this).find(".row_key").map(function(i,a) { return "hover_"+a.innerText; }).toArray().join(" "));
	};
	$(".button:has(.row_key)").off("mouseenter", highlight).on("mouseenter", highlight);

	// $("#stores .storeRow > .row_key").map(function(i,a) { return a.innerText.replace(/\W+/g, "_").replace(function(t) { "#}) })
	
});
