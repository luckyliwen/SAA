saa = {};
saa.cfg = {};
saa.util = {};
saa.model = {};
saa.view = {};
saa.controller = {};
saa.uilib = {};

/**
 * UI part can choose different action according to the load status  
 */
saa.LoadStatus = {
		NotStart: 'n',
		Pending:  'P',
		Succ:	  's',
		Fail: 	  'f'	
};

saa.PageIdx = {
	Org: 'Org',
	Map: 'Map'
};


/*************** Hijacking for Gold Reflection *************/
sap.ui.core.BusyIndicator.attachOpen(function(oEvent) {
	if (sap.ui.getCore().getConfiguration().getTheme() == "sap_goldreflection") { // this line is a hack, the rest of this coding is what a BusyIndicator hijacker could do
		$Busy = oEvent.getParameter("$Busy");
		iBusyPageWidth = jQuery(document.body).width();
		$Busy.css("top", "0").css("width", iBusyPageWidth + "px");
		bBusyAnimate = true;
		iBusyLeft = $Busy[0].offsetLeft;
		window.setTimeout(animationStep, iBusyTimeStep);
	}
});
sap.ui.core.BusyIndicator.attachClose(function(oEvent) {
	bBusyAnimate = false;
});

var bBusyAnimate = false;
var iBusyLeft = 0;
var iBusyDelta = 60;
var iBusyTimeStep = 50;
var iBusyWidth = 500;
var iBusyPageWidth;
var $Busy;

function animationStep() {
	if (bBusyAnimate) {
		iBusyLeft += iBusyDelta;
		if (iBusyLeft > iBusyPageWidth) {
			iBusyLeft = -iBusyWidth;
		}
		$Busy.css("background-position", iBusyLeft + "px 0px");
		window.setTimeout(animationStep, iBusyTimeStep);
	}
}
/*************** END of Hijacking for Gold Reflection *************/

/**
 * Add a format for the String, when it is more clear to call format instead of do the pure +, then call this
 
 For example, when you need create a string like  " $1M ( 5%) Left"  or  " $1M ( 5%) Over", without the String.format() function, you code like following:
 
    	leftOver = "$" + amount + "(" + variancePercentage + "%)";
 		if ( remain  >= 0) {
			leftOver += " Left";
		} else {
			leftOver += " Over";
		}
With the format function, it is more easy:

	   leftOver = "${0} ({1}% {2})".sapFormat(amount, variancePercentage, leftOver ? "left" : "Over");   

 	here use the name sapFormat instead of normally format is to avoid name conflict.  Otherwise, if some others use the format then it will have conflict
 * @returns
 */
String.prototype.sapFormat = function() {
	  var args = arguments;
	  return this.replace(/{(\d+)}/g, function(match, number) { 
	    return typeof args[number] != 'undefined'
	      ? args[number]
	      : match
	    ;
	  });
};


/**
 * 
 */
saa.ModelMng = {

	createUserTip: function() {
		//
		var 	mydiv = '<div id="gUsertip" class="usertip shadow"><img '
		      	+ 'width="100" height="130" border="0" id="gUsertipimg" alt=""/></div>';
		$('body').prepend(mydiv);
	},
		
	init: function() {
		
		saa.model.TextMng.init();
		saa.model.Master.init();
		saa.model.CompanyOrg.init();
		
		saa.cfg.Cfg.init();
		saa.model.ODataHelper.init();
		saa.model.OrganizationMng.init();
		
		this._mainView = sap.ui.view({
			id : 'main-view',
			viewName : "saa.view.Main",
			type : sap.ui.core.mvc.ViewType.JS
		});
	
		this._mainView.doInit();
		
		this.createUserTip();
	},
	
	_mainView: null
};
	
