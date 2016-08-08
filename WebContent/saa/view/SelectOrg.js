jQuery.sap.require("sap.ui.commons.Dialog");

sap.ui.commons.Dialog.extend("saa.view.SelectOrg",{
	metadata : 
    {                            
          properties : 
          {
               
          },     
   }, 
   
   renderer : 'sap.ui.commons.DialogRenderer',
   
   doInit: function() {
	
	   this.setTitle("Please select the organizaiton");
	   this.setWidth('360px');
	   this.setHeight('300px');
	   this.setModal(true);
	   
	   //create radio group
	   this._oRadioGroup = new sap.ui.commons.RadioButtonGroup();

	   this._oRadioGroup.setModel( saa.model.CompanyOrg.getModel()  );
	   
	   /*this._oRadioGroup.bindItems(
			   saa.model.CompanyOrg.getOrganizationPath(),
			   new sap.ui.core.Item( {text: '{name}'})
	    );*/
	   
	   //??tmp
	   var data = saa.model.CompanyOrg.getOrganizationData();
	   
	   for (var i=0; i< data.length; i++) {
		   var name = data[i].name;
		   this._oRadioGroup.addItem(new sap.ui.core.Item( {text: name}));   
	   }
	   
	   
	   var that = this;
	   this._oRadioGroup.attachSelect( function() {
		   that._oOkBtn.setEnabled( true); 
	   });
	   this.addContent(this._oRadioGroup);

	   //only ok btn is enough
	   var okBtn = new sap.ui.commons.Button({text: 'OK', enabled: true});
	   this.addButton( okBtn);
	   
	   okBtn.attachPress( this.onOkButtonPressed, this);
   
	   this._oOkBtn = okBtn;
   },
   
   
   
   onOkButtonPressed: function() {
	   
	   saa.model.CompanyOrg.setSelectedOrg( this._oRadioGroup.getSelectedIndex());
	   
	   this.close();
	   
	   //Inform other view that that now has select org, so can start load data.
	   var bus = sap.ui.getCore().getEventBus();
	   bus.publish("main", "organizationSelected");
   },
   
   
   _oRadioGroup: null,
   _oOkBtn: null,
   
});