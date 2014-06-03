
(function($) {$(function() {
	// --------------------------------------------------
	// hover
	// --------------------------------------------------
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
	// Need interval in order ot update new items
	$("#main")
		.on("mouseenter", ".button:has(.row_key)", highlight)
		.on("mouseleave", ".button:has(.row_key)", unhighlight)
	;

	var style = $("#stores .storeRow").map(function(i,a) { 
		return "#main."+a.id.replace(/^row/, "hover") + " #"+a.id; 
	}).toArray().join(", ")+" { background-color: #fee; }";
	$("head").append("<style type='text/css'>"+style+"</style>")

	// --------------------------------------------------
	// click buttons
	// --------------------------------------------------
	if(window["buttonInterval"]) window.clearInterval(window.buttonInterval);
	window.buttonInterval = window.setInterval(function() {
		$("#trapsButton,#gatherButton,#build_trap").not(".disabled").click();
		// - events -----------------------------------------
		// Ruined traps
		$("#event:has(.eventTitle:contains(A Ruined Trap)) #track,#end").click()
		// Noises
		$("#event:has(.eventTitle:contains(Noises)) #ignore").click()
	}, 350);
});})(jQuery);
