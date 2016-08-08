sap.ui.commons.TextView.extend("saa.uilib.TipTextView", {
	
	 metadata : 
	 {                            
        properties : 
        {
        	//Used to bind the image
			"image" : {type: "string", defaultValue: "", bindable : "bindable"},
        },
		events: 
		{
			"mouseOver" : {},
        	"mouseOut" :  {}
		}        
	}, //end of metadata
	
	renderer : 'sap.ui.commons.TextViewRenderer',
	
	//the normal behavious for mouse over and out, show or hide image
	init: function() {	
		/*?? call by this not work,why?
		*/
		this.attachMouseOver( this.onMouseOver);
		
		this.attachMouseOut( this.onMouseOut);
	},
	
	onMouseOver: function() {
		
		var text = this.getText();
		var image = this.getImage();
		
		//console.error("--- in the called function", this, text, image);
		
		if (image != "") {
			var id = "#" + this.getId();
			
			var jqThis = $(id);
			
			//need move a little down and left ?? why fail
			var top = jqThis.offset().top + jqThis.height();
			var left = jqThis.offset().left + jqThis.width() /2 ;
			
			//var top = $(id).offset().top + $(id).height();
			//var left = $(id).offset().left + $(id).width() /2 ;
			
			$('#gUsertipimg').attr('src',image);
			
			$('#gUsertip').show().css({"left": left, "top": top});
		}
	},
	
	onMouseOut: function() {
		var image = this.getImage();
		if (image != "") {
			$('#gUsertip').hide();
		}
	}
});
	
//Just try
saa.uilib.TipTextView.M_EVENTS = {'mouseOver':'mouseOver', 'mouseOut':'mouseOut',  };

jQuery.sap.require("sap.ui.core.EnabledPropagator");

sap.ui.core.EnabledPropagator.apply(saa.uilib.TipTextView.prototype, [true]);

//==now only fire event is enough
/**
 * Function is called when button is clicked.
 *
 * @param {jQuery.Event} oEvent
 * @private
 */
saa.uilib.TipTextView.prototype.onmouseover = function(oEvent) {
	this.fireMouseOver({/* no parameters */});

	oEvent.preventDefault();
	oEvent.stopPropagation();
};

saa.uilib.TipTextView.prototype.onmouseout = function(oEvent) {
	this.fireMouseOut({/* no parameters */});

	oEvent.preventDefault();
	oEvent.stopPropagation();
};
