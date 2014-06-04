// Well it's not perfect, but it's here
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
	if(window.clearInterval(window["highlightInterval"]||0));
	window.highlightInterval = window.setInterval(function() {
		// Highlight required items on mouseover
		$(".button:has(.row_key)").off("mouseenter mouseleave").hover(highlight, unhighlight);
	}, 1000);
	
	// Add a stylesheet for the highlighting 
	var style = $("#stores .storeRow").map(function(i,a) { 
		return "#main."+a.id.replace(/^row/, "hover") + " #"+a.id; 
	}).toArray().join(", ")+" { background-color: #fee; }";
	$("head").append("<style type='text/css'>"+style+"</style>")

	// --------------------------------------------------
	// click buttons
	// --------------------------------------------------
	if(window["buttonInterval"]) window.clearInterval(window.buttonInterval);
	window.buttonInterval = window.setInterval(function() {
		// Auto-harvest. Best if on the town tab, not the room tab
		$("#trapsButton,#gatherButton,#build_trap").not(".disabled").click();
		// - Keep 5 torches
		if($("#row_torch>.row_val").text() < 5) $("#build_torch").click();
		// - events -----------------------------------------
		// Ruined traps
		$("#event:has(.eventTitle:contains(A Ruined Trap)) #track,#end").click();
		// Noises
		$("#event:has(.eventTitle:contains(Noises)) #ignore").click();
		// Mysterious Wanderer
		$("#event:has(.eventTitle:contains(Mysterious Wanderer)) #deny").click();
	}, 500);
});})(jQuery);