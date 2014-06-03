
(function($) {$(function() {
	var hoverClasses = function(self) {
		return $(self).find(".row_key").map(function(i,a) { 
			return "hover_"+a.innerText.replace(/\W+/g, '-');
		}).toArray().join(" ")
	};
	var highlight = function() {
		$("#main").addClass(hoverClasses(this));
	};
	var unhighlight = function() {
		$("#main").removeClass(hoverClasses(this));
	};
	$(".button:has(.row_key)").hover(highlight, unhighlight);

	var style = $("#stores .storeRow").map(function(i,a) { 
		return "#main."+a.id.replace(/^row/, "hover") + " #"+a.id; 
	}).toArray().join(", ")+" { background-color: #fee; }";
	$("head").append("<style type='text/css'>"+style+"</style>")
	
});})(jQuery);
