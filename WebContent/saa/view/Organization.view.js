jQuery.sap.declare("saa.view.Organization");
jQuery.sap.require("sap.ui.core.mvc.JSView");
jQuery.sap.require("sap.ui.core.library");
jQuery.sap.require("sap.ui.core.Control");

var gTable;
sap.ui.commons.Link.extend("MyLink", {
	metadata : {
		properties : {
			"myhref" : {type: "string", defaultValue: "", bindable : "bindable"},
		}
	},
	
	renderer : function(oRm, oControl) {
		//console.log("<< text", oControl.getText());
		oControl.setHref( "mailto:" + oControl.getText());
		sap.ui.commons.LinkRenderer.render(oRm,oControl);
	}
});
		

sap.ui.core.mvc.JSView.extend("saa.view.Organization", {
	metadata : {
		properties : {
			
		}
	},

	getControllerName: function() {
		return "saa.controller.Organization";
	},	
	
	// Just reuse the JSView is enough
	renderer : 'sap.ui.core.mvc.JSViewRenderer',
	
	doInit: function() {
		var bus = sap.ui.getCore().getEventBus();
		bus.subscribe("main", "employPropChanged", this.onEmployPropChanged, this);

		bus.subscribe("main", "organizationSelected", this.onOrganizationSelected, this);
		
		this._orgTreeTable = this.createTreeTable( this.getController());
		
		/* don't have method: this._orgTreeTable.attachAfterRendering( function(){
			saa.OrgTreeTableWidth = $('OrgTreeTable').width();
		});
		*/
		var emptyHtml = new sap.ui.core.HTML({content: "<div></div>"});
		
		this.addContent( this._orgTreeTable );
		this.addContent(emptyHtml);
		
		emptyHtml.attachAfterRendering( function(){
			saa.OrgTreeTableWidth = $('#OrgTreeTable').width();
			console.error("++++ in view width", saa.OrgTreeTableWidth);
		});
		
		//this.loadData();
	},
	
   createContent : function(oController) {
	   return null;
   }, 
   
   loadData: function() {
	   sap.ui.core.BusyIndicator.show(0);
	   this._orgModelInfo = saa.model.OrganizationMng.loadOrganization(
			  this.onLoadDataSucc,
			  this.onLoadDataFail,
			  this,
			  null);
   },

   onOrganizationSelected: function() {
	   this.loadData();
   },
   
   /**
    * Call back for the employ property changed, now come from 'Edit Dialog'
    * @param employ
    */
   onEmployPropChanged : function ( channel, event, employ) {
	   //Just use the new prop to reflect it on screen
	    var selIdx = this._orgTreeTable.getSelectedIndex();
		
		var context = this._orgTreeTable.getContextByIndex(selIdx);
		
		var model = this._orgTreeTable.getModel(); 
		$.each( employ, function(k,v) {
			model.setProperty(k, v, context);
		});
		
   },
   
   onLoadDataSucc: function() {
	   //only need bind 
	   this.setModel( this._orgModelInfo.getSAPModel());
	   this._orgTreeTable.bindRows(  this._orgModelInfo.getRowInfo());
	   
	   var bus = sap.ui.getCore().getEventBus();
	   sap.ui.core.BusyIndicator.hide();
	   
	   //set the no data prompt for the search
	   var noData = new sap.ui.commons.TextView({text: "\r\n\r\n\r\n\r\n\r\n\r\nNobody was found!"});
	   
	   //as now the old version not supported,so just use the normal TextView
	   //??var noData = new sap.ui.commons.FormattedTextView({htmlText: "<br><br><br><br><h4>Nobody was found!<h4>"});
	   this._orgTreeTable.setNoData(noData);
	   
	   bus.publish("main", "loadOrganizationSucc");
	   
   },
   
   onLoadDataFail: function() {
	   sap.ui.core.BusyIndicator.hide();
	   alert("Load data from backend failed, please contact Lucky li for detail");
	   
	   
   },
   
	onExpandAll: function() {
		saa.util.Util.expandTreeNodes(this._orgTreeTable, true, -1);
	},
	onCallapseAll: function() {
		saa.util.Util.expandTreeNodes(this._orgTreeTable, false, 0);
	},
	onExpandToLevel: function(value) {
		var level = parseInt(value);
		saa.util.Util.expandTreeNodes(this._orgTreeTable, false, 0);
		saa.util.Util.expandTreeNodes(this._orgTreeTable, true, level);
	},
   
	_createTableToolbar:function(oController){
		var that = this;
		var oButtonExpandAll = new sap.ui.commons.Button({
					text : saa.getText("ExpandAll"),
					press: function() 
					{
						that.onExpandAll();
					}
				});
		var oButtonCollapseAll = new sap.ui.commons.Button({
					text : saa.getText("CollapseAll"),
					press: function() 
					{
						that.onCallapseAll();
					}					
				});
		var oButtonExpandToLevel = new sap.ui.commons.Button({
					text : saa.getText("ExpandToLevel"),
					press: function() 
					{
						that.onExpandToLevel(oTextFieldToLevel.getValue());
					}							
				});

		var oTextFieldToLevel = new sap.ui.commons.TextField({
									value: "2",
									width: "25px", 
									maxLength: 2,				
								});
		var oSearchField = 	new sap.ui.commons.SearchField({
											enableListSuggest: false,
											enableClear: true,
											startSuggestion: 0,	
											suggest: function(oEvent)
											{
												oController.onSearchSuggest(oEvent);
											}						
						});
		
		
		//email 
		var oButtonSendEmail = new sap.ui.commons.Button({
			text : saa.getText("SendEmail"),
			press: function() 
			{
				that.onSendEmailPressed();
			}							
		});
		

		//show on map 
		var oButtonShowOnMap = new sap.ui.commons.Button({
			text : "Show selected people on Map",
			press: function() 
			{
				that.showSelectedOnMap();
			}							
		});
		
		//poll 
		var oButtonCreatePoll = new sap.ui.commons.Button({
			text : saa.getText("CreatePoll"),
			press: function() 
			{
				oController.CreatePoll.call(oController);
			}							
		});
		
		var oButtonEditEmploy = new sap.ui.commons.Button({
			text : saa.getText("Edit"),
			enabled: false,
			press: function() 
			{
				that.onEditEmployPressed();
			}							
		});
		
		this._oBtnEdit = oButtonEditEmploy;
		
		
		/*
		var toolbar = new sap.ui.commons.Toolbar({
			items: [oButtonExpandAll, oButtonCollapseAll, oButtonExpandToLevel, oTextFieldToLevel, oSearchField, 
			        oButtonSendEmail, oButtonShowOnMap,  oButtonEditEmploy ]
		}).addStyleClass("treeTableToolbar");		
		*/
		
		var toolbar = new sap.ui.commons.Toolbar({
			items: [oButtonExpandAll, oButtonCollapseAll,  
			        oButtonSendEmail, oButtonShowOnMap,  oButtonEditEmploy ]
		}).addStyleClass("treeTableToolbar");
		
		return toolbar;
	},
	
	onSendEmailPressed: function() {
		var aEmail = saa.model.OrganizationMng.getEmailListForSelected();	
		var url="mailto:";
		url += aEmail.join(';');
		
		window.open(url, "_parent");
	},
	
	onEditEmployPressed: function() {
		if (this._oEmployEditDialog == null) {
			this._oEmployEditDialog = new saa.view.EmployEdit();
			this._oEmployEditDialog.doInit();
		}
		
		var id = this.getSelectedRowEmployId();
		
		if (id != "") {
			this._oEmployEditDialog.setEmployId(id);
			
			this._oEmployEditDialog.open();
		}
	},
	
	getSelectedRowEmployId: function() {
		var selIdx = this._orgTreeTable.getSelectedIndex();
		if (selIdx == -1)
			return "";
		
		var context = this._orgTreeTable.getContextByIndex(selIdx);
		
		var id = this._orgTreeTable.getModel().getProperty("ID",context);
		return id;
	},
	
	showSelectedOnMap: function() {
		saa.view.Helper.simulateTabClicked( saa.PageIdx.Map);
		
		//use event to transfer
		var bus = sap.ui.getCore().getEventBus();
		bus.publish("main", "showSelectedOnMap");
	},
	
	//==as later different field will trigger different action, so here just use one function to do so
	_createIDColumnInfo: function() {
		//var template = new saa.cfg.Control.Text({text:"{ID}", enabled: false}); 
		
		var oCB = new sap.ui.commons.CheckBox();
		//var oCB = new saa.uilib.TipCheckBox( {image:"{Image}"});
		//oCB.doInit();
		//var tipTextView = new saa.cfg.Control.Text({text:"{Name}", enabled: false});
		
		oCB.bindProperty("text", "ID");
		oCB.bindProperty('checked', 'checked');
	
		oCB.attachChange( this.onCheckboxChanged, this );
		
		return ({ "label": "{i18n>ID}",  "template": oCB, sort:"ID",  filter: "ID"});
	}, 
	
	onCheckboxChanged: function(oEvent) {
		//console.error(" === check box changed", oEvent);
		
		var flag = oEvent.getParameter('checked');
		
		//then use a loop to set or unset the subchilds
		var binding = this._orgTreeTable.getBinding('rows');
		var oModel = this._orgTreeTable.getModel();
		
		function updateIt(context) {
			var aNodeContexts  = binding.getNodeContexts(context);	
			for ( var i = 0; i< aNodeContexts.length; i++) {
				var ctx = aNodeContexts[i];
				oModel.setProperty('checked', flag, ctx);
				
				updateIt( ctx);
			}
			
			//Then call it sub child one by one
		}
		
		updateIt( oEvent.oSource.getBindingContext());
	},
	
	
	onTreeTableRowSelectChanged : function( oEvent) {
		var selIdx = this._orgTreeTable.getSelectedIndex();
		if (selIdx == -1) {
			this._oBtnEdit.setEnabled(false);
			this._oBtnEdit.setText('Edit');
		} else {
			this._oBtnEdit.setEnabled(true);
			
			//Also set the name so user is easy to know edit who
			var context = oEvent.mParameters.rowContext;
			var name = oEvent.oSource.getModel().getProperty('Name', context);
			this._oBtnEdit.setText('Edit ' + name);
		} 
	},
	
	_createNameColumnInfo_old: function() {
		var tipTextView = new saa.cfg.Control.Text({text:"{Name}", enabled: false}); 
		
		
		return ({ "label": "{i18n>Name}",  "template": template,   filter: "Name"} );
	},
	
	
	
	//==Try to show image
	 _createNameColumnInfo: function() {
		var tipTextView = new saa.uilib.TipTextView({text:"{Name}", image:"{Image}", enabled: false});
	
		return ({ "label": "{i18n>Name}",  "template": tipTextView,   filter: "Name"} );
	},
	
	
	_createName2ColumnInfo: function() {
		var tipTextView = new saa.uilib.TipTextView({text:"{Name2}", image:"{Image}", enabled: false});
		
		/*tipTextView.attachMouseOver( function(oEvent) {
			this.onMouseOver();
		});
		
		tipTextView.attachMouseOut( function(oEvent) {
			this.onMouseOut();
		});*/
		
		return ({ "label": "{i18n>Name 2}",  "template": tipTextView,   filter: "Name2"} );
	},
	
	
	//here need get the image for the manager
	_createManagerColumnInfo: function() {
		var tipTextView =new saa.uilib.TipTextView({text:"{ManagerName}", 	image:"{ManagerImage}",  enabled: false});
		
		tipTextView.attachMouseOver( function(oEvent) {
			this.onMouseOver();
		});
		
		tipTextView.attachMouseOut( function(oEvent) {
			this.onMouseOut();
		});
		
		return ({ "label": "{i18n>ManagerName}",  "template": tipTextView,  filter: "ManagerName"});
	},
	
	_createOrganizationColumnInfo: function() {
		var template = new saa.cfg.Control.Text({text:"{Organization}", enabled: false}); 
		return ({ "label": "{i18n>Organization}",  "template": template,   filter: "Organization"});
	},
	
	_createEmailColumnInfo: function() {
		//var template = new saa.cfg.Control.Link( {text: "{Email}", enabled: false}); 
		//var template = new sap.ui.commons.Link({text: "{Email}" });
		
		var template = new MyLink({text: "{Email}", myhref: "{Email}"});
		
		/*template.bindText( "{Email}", function(value) {
			this.setHref("mailto:" + value);
			return value;
		});*/
		
		/*template.bindProperty("myhref", "{Email}", function(value) {
			//this.setHref("mailto:" + value);
			console.error("===",value,this);
			return "mailto:" + value;
		});*/
		
		/*template.bindHref("{Email}", function(value){
			return "mailto:" + value;
		});*/
		//template.setHref("mailto:lucky.li@sap.com")
		
		
		return ({ "label": "{i18n>Email}",  "template": template,  filter: "Email"});
	},
	
	_createOfficeColumnInfo: function() {
		var template = new saa.cfg.Control.Text({text:"{Office}", enabled: false}); 
		return ({ "label": "{i18n>Office}",  "template": template,   filter: "Office"});
	},
	
	_createPhoneColumnInfo: function() {
		var template = new saa.cfg.Control.Text({text:"{Phone}", enabled: false}); 
		return ({ "label": "{i18n>Phone}",  "template": template,  filter: "Phone"});
	},
	
	_createMobileColumnInfo: function() {
		var template = new saa.cfg.Control.Text({text:"{Mobile}", enabled: false}); 
		return ({ "label": "{i18n>Mobile}",  "template": template,   filter: "Mobile"});
	},
	
	_createRoleColumnInfo: function() {
		var template = new saa.cfg.Control.Text({text:"{Role}", enabled: false}); 
		return ({ "label": "{i18n>Role}",  "template": template,  filter: "Role"});
	},
	
	_createHobbyColumnInfo: function() {
		var template = new saa.cfg.Control.Text({text:"{Hobby}", enabled: false}); 
		return ({ "label": "{i18n>Hobby}",  "template": template,  filter: "Hobby"});
	},
	
	_createExpertiseColumnInfo: function() {
		var template = new saa.cfg.Control.Text({text:"{Expertise}", enabled: false}); 
		return ({ "label": "{i18n>Expertise}",  "template": template,   filter: "Expertise"});
	},
	
	_createAddressColumnInfo: function() {
		var template = new saa.cfg.Control.Text({text:"{Address}", enabled: false}); 
		return ({ "label": "{i18n>Address}",  "template": template, filter: "Address"});
	},
	
	
	createTreeTable: function(oController) {
		
		this._treeTableToolbar = this._createTableToolbar();
		
		var cols = [];
		cols.push( this._createIDColumnInfo() );
		cols.push( this._createNameColumnInfo() );
		cols.push( this._createName2ColumnInfo() );
		
		
		cols.push( this._createManagerColumnInfo() );
		cols.push( this._createOrganizationColumnInfo() );
		

		cols.push( this._createEmailColumnInfo() );
		cols.push( this._createOfficeColumnInfo() );
		cols.push( this._createPhoneColumnInfo() );
		cols.push( this._createMobileColumnInfo() );
		
		cols.push( this._createRoleColumnInfo() );
		cols.push( this._createExpertiseColumnInfo() );
		cols.push( this._createHobbyColumnInfo() );
		cols.push( this._createAddressColumnInfo() );
		
		//widh for differetn col  "id" name  chineseName  manager  org  email office phone mobile role expert  hobby address
	    var flexiableWidthRatio = [ 3,  2,    2  ,         2,       2,    3,    2   ,  2 ,   2,    2,   3 ,      3 ,    5];	
	    
	    var total = 0;
	    for(var i=0 ;i <flexiableWidthRatio.length;i++){
	    	total += flexiableWidthRatio[i];
	    }
	    
		//then add by same way
		var columns = [];
		$.each(cols, function(idx, ele) {
			columns.push(new sap.ui.table.Column({
				label : ele.label,
				template: ele.template,
				width: flexiableWidthRatio[idx]*100/total +"%",
				sortProperty:  ele.sort, 
				filterProperty: ele.filter,
			}));
		});
		
		//??simple way, need change
		var noData = new sap.ui.commons.TextView({text: "\r\n\r\n\r\n\r\n\r\n\r\nLoading, please wait..."});
		var oTable = new saa.cfg.Control.TreeTable("OrgTreeTable", 
			{
					selectionBehavior:sap.ui.table.SelectionBehavior.RowOnly,
					selectionMode : sap.ui.table.SelectionMode.Single,
					allowColumnReordering : true,
					showNoData: true,
					expandFirstLevel : true,
					columns: columns,
					toolbar: this._treeTableToolbar,
					visibleRowCount:  25
			});
		
		oTable.setNoData(noData);
		oTable.setWidth('100%');
		
		//register call back 
		oTable.attachRowSelectionChange(this.onTreeTableRowSelectChanged, this);
gTable = oTable;
		return oTable;
	},
		

	_orgTreeTable : null,
	_orgModelInfo : null,
	_oEmployEditDialog: null,
	
	_oBtnEdit	: null,
});