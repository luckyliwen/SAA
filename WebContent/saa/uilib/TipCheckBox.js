sap.ui.commons.CheckBox.extend("saa.uilib.TipCheckBox", {
	
	 metadata : 
	 {                            
        properties : 
        {
        	//Used to bind the image
			"image" : {type: "string", defaultValue: "", bindable : "bindable"},
			"design" :  {type: "string", defaultValue: "", bindable : "bindable"},
        },
		events: 
		{
			"mouseOver" : {},
        	"mouseOut" :  {}
		}        
	}, //end of metadata
	
	
	renderer : 'sap.ui.commons.TextViewRenderer',
	
	//the normal behavious for mouse over and out, show or hide image
	doInit: function() {	
		this.attachMouseOver( this.onMouseOver);
		
		this.attachMouseOut( this.onMouseOut);
	},
	
	onMouseOver: function() {
		
		var text = this.getText();
		var image = this.getImage();
		
		//console.error("--- in the called function", this, text, image);
		
		if (image != "") {
			//??later need change 
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
saa.uilib.TipCheckBox.M_EVENTS = {'mouseOver':'mouseOver', 'mouseOut':'mouseOut',  };

jQuery.sap.require("sap.ui.core.EnabledPropagator");

sap.ui.core.EnabledPropagator.apply(saa.uilib.TipCheckBox.prototype, [true]);

//==now only fire event is enough
/**
 * Function is called when button is clicked.
 *
 * @param {jQuery.Event} oEvent
 * @private
 */
saa.uilib.TipCheckBox.prototype.onmouseover = function(oEvent) {
	//if (this.getEnabled()){
		this.fireMouseOver({/* no parameters */});
	//}

	oEvent.preventDefault();
	oEvent.stopPropagation();
};

saa.uilib.TipCheckBox.prototype.onmouseout = function(oEvent) {
	//if (this.getEnabled()){
		this.fireMouseOut({/* no parameters */});
	//}

	oEvent.preventDefault();
	oEvent.stopPropagation();
};
