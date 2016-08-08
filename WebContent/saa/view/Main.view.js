
//==some view related event
saa.view = {};
saa.view.Helper = {};
saa.view.Helper.simulateTabClicked = function( pageIdx) {
		var id = '#NavItem_' + pageIdx;
		$(id).click();
};
saa.OrgTreeTableWidth = 0;

sap.ui.commons.Dialog.extend("saa.view.MyDlg", {
	
});

sap.ui.jsview("saa.view.Main", {
	
	getControllerName: function() {
		return "saa.controller.Main";
	},	

	doInit: function(){
		this._oController = this.getController();
		
		this._oShell = this.createShell();
		this.createTopViews();
		this._oShell.setContent( this._orgView);
		
		this._oShell.placeAt("main_content");
		
		var selectOrgDlg = new saa.view.SelectOrg();
		selectOrgDlg.doInit();
		selectOrgDlg.open();
	},
	
	
	createContent: function(oController) {
		return null;
	},
	
	
	onWorksetItemSelected: function(oEvent) {
		var id = oEvent.getParameter("id");
		var oShell = oEvent.oSource;
		
		var view = null;
		switch ( id ) {
			case 'NavItem_Org': view = this._orgView; break;
			case 'NavItem_Map': view = this._mapView; break;
			default: break;
		}
		
		oShell.setContent( view ) ;
	},
	
	/*
	*Simulate user click a tab, used by pie select, or click the alert jump to other view, for ux3 and normal tab have different action
	*/
	simulateTabItemClicked: function(idx) {
		//by this way not work, so use the jQuery this._oShell.fireWorksetItemSelected('NavItem_' + idx);
		var id = '#NavItem_' + idx;
		$(id).click();
	},
	
	
	createTopViews: function() {
		//create org, map
		this._orgView = new saa.view.Organization({
			id : "MainOrgView",
			viewName : "saa.view.Organization",
		});
		
		this._orgView.doInit();
		
		this._mapView = new  saa.view.Map({
			id : "MainMapView",
			viewName : "saa.view.Map",
		});
		
		this._mapView.doInit();
		
	},

	createShell : function() {
		 var that = this;
		 var oShell = new sap.ui.ux3.Shell("mainShell", {
			 //title
			appTitle: "SAP Employee Easy Search",
			appIcon: "images/SAPLogo.png",
			appIconTooltip: "SAP Activity Assistent",
			
			headerType: sap.ui.ux3.ShellHeaderType.SlimNavigation,
			fullHeightContent: false,
			
			//left part
			showLogoutButton: false,
			showSearchTool: false,
			showInspectorTool: false,
			showFeederTool: false,
			
			worksetItems: [  new sap.ui.ux3.NavigationItem("NavItem_Org", 
								{key:"NavItem_Org",	text:"Organization"}),
			                 new sap.ui.ux3.NavigationItem("NavItem_Map", 
								{key:"NavItem_Map",   text:"Map"}),
			               ],
			
			                 
	         headerItems: [
						/*new sap.ui.commons.Button({
							text: "Logout",
							//icon: "images/LeftNavi_Alert_Button.png",
							lite: true,
							press: function(){
							}
						}),
						new sap.ui.commons.Button({
							text: "Setting",
							//icon: "images/LeftNavi_Alert_Button.png",
							lite: true,
							press: function(){
							}
						}),
						*/
						new sap.ui.commons.Button({
							text: "Help",
							//icon: "images/LeftNavi_Alert_Button.png",
							lite: true,
							press: function(){
							}
						}),
                    ]
		 });
		 
		 oShell.attachWorksetItemSelected( this.onWorksetItemSelected, this);
		 
		 return oShell;
	},

	/**
	 * 
	 */
	onReady: function() {
		this.bindEvents();
	},
	
	//==main data 
	_oShell: null,
	_orgView: null,
	_mapView: null
});
