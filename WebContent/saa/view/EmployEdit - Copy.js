jQuery.sap.require("sap.ui.commons.Dialog");

saa.Prop = {
		Role:	'r',
		Hobby: 'h',
		Expertise: 'e'
};

//sap.ui.commons.Dialog.extend("saa.view.EmployEditDialog",{
sap.ui.commons.Dialog.extend("saa.view.EmployEdit",{
	metadata : 
    {                            
          properties : 
          {
               //"employId" : "string",
          },     
   }, 
   
   renderer : 'sap.ui.commons.DialogRenderer',
   
      
   /**
    * from the string content check or not check the checkbox
    */
   setCheckboxValueByString: function( aCtrl, content) {
	   var arr = content.split(";");
	   for (var i=0; i<aCtrl.length; i++) {
		   var ctrl = aCtrl[i];
		   var text = ctrl.getText();
		   if ( arr.indexOf(text) == -1 ) {
			   ctrl.setChecked(false);
		   } else {
			   ctrl.setChecked(true);
		   }
	   }
   },
   
   /**
    * Get the extra string which is not listed in the check box list
    * @param aText
    * @param content
    */
   getExtraSring: function(aText, content) {
	   if ( content == "")
		   return "";
	   
	   var ret ="";
	   
	   var arr = content.split(";");
	   for (var i=0; i<arr.length; i++) {
		   var val = arr[i];
		   if ( val != "") {
			   if ( aText.indexOf( val ) == -1) {
				   ret += arr[i];
				   if ( i != (arr.length-1))
					   ret += ";"
			   }
		   }
	   }
	   return ret;
   },
   
   setEmployId: function( id ) {
	   //from the id get information
	   var employ = saa.model.OrganizationMng.getEmployById(id);
	   this._oEmploy = employ;
	   
	   this.setTitle("Detail Information of " + employ.Name);
	   
	   
	   //for the basic information, just use a loop
	   for (var i=0; i<this._mBasic.length; i++) {
		   var ctrl = this._mBasic[i].ctrl;
		   var key = this._mBasic[i].key;
		   
		   ctrl.setValue( employ[key]);
	   }
	   
	   
	   this._oProfileCtrl.setValue( employ.Profile);
	   
	   //set the role list
	   this.setCheckboxValueByString( this._aRoleCheckbox, employ.Role);
	   this._oRoleExtra.setValue( this.getExtraSring(this._aRole, employ.Role));
	
	   //set the hobby list
	   this.setCheckboxValueByString( this._aHobbyCheckbox, employ.Hobby);
	   this._oHobbyExtra.setValue( this.getExtraSring(this._aHobby, employ.Hobby));
	   
	   //set the expertise list
	   this.setCheckboxValueByString( this._aExpertiseCheckbox, employ.Expertise);
	   this._oExpertiseExtra.setValue( this.getExtraSring(this._aExpertise, employ.Expertise));
   },
   
   
createBasicPanel: function() {
   
   var oMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
		layoutFixed : true,
		columns : 4,
		width : '100%',
		widths: ['15%', '35%', '15%', '35%'],	
	});
  
	  for (var iRow =0; iRow< this._mBasic.length/2 ; iRow++) {
		   var row = new sap.ui.commons.layout.MatrixLayoutRow({ /*height: '40px'*/});
		   oMatrixLayout.addRow(row);
		 
		  var aCell = [];
	   	  for (var i=0; i<4; i++) {
	   		  var cell = new sap.ui.commons.layout.MatrixLayoutCell({ hAlign:sap.ui.commons.layout.HAlign.Left});
	   		  row.addCell(cell);
	   		  aCell.push(cell);
	   	  }
	   	  
	   	  aCell[0].addContent(  new sap.ui.commons.Label({text:  this._mBasic[ iRow * 2].name, design: sap.ui.commons.LabelDesign.Bold }));
	   	  var ctrl0 = new sap.ui.commons.TextField();
	   	  aCell[1].addContent( ctrl0);
	   	  this._mBasic[ iRow * 2].ctrl = ctrl0;
	   	  
	   	  aCell[2].addContent(  new sap.ui.commons.Label({text:  this._mBasic[ iRow * 2 + 1].name, design: sap.ui.commons.LabelDesign.Bold }));
	   	  var ctrl1 = new sap.ui.commons.TextField();
	   	  aCell[3].addContent( ctrl1);
	   	  this._mBasic[ iRow * 2 + 1].ctrl = ctrl1;
	  }
  
	  var panel = new sap.ui.commons.Panel({
		   title: new sap.ui.commons.Title({text: "Basic Information"}), 
		   content: [ oMatrixLayout 
		            ]
	   });
	  return panel;
   },
   
   doInit: function() {
	   
	   this.setWidth("900px");
	   this.setHeight("800px");
	   this.setModal(true);
	   
	   var panelBasic = this.createBasicPanel();
	   
	   
	   var extraAreaWidth = "700px";
	   //profile
	   this._oProfileCtrl = new sap.ui.commons.TextArea('EmployProfile', {rows: 10, width:"800px" });
	   var panelProfile =  new sap.ui.commons.Panel(
			   {
				   title: new sap.ui.commons.Title( {text: "Profile"}),
				   content: this._oProfileCtrl 
			   } );
	   
	   
	 	//role	
	   this._aRole = saa.model.Master.getRoleList();
	   title = new sap.ui.commons.Label({text: "Role"});
	   var matrixRole = this.createMatrixControl(this._aRole, 6, this._aRoleCheckbox);
	   
	   this._oRoleExtra = new sap.ui.commons.TextArea({rows: 1, width:extraAreaWidth});
	   var panelRole = new sap.ui.commons.Panel({
		   title: new sap.ui.commons.Title({text: "Roles"}), 
		   content: [ matrixRole, 
		              new sap.ui.commons.layout.HorizontalLayout({
		            	  content:[ new sap.ui.commons.Label({text: "Others: Seperate by ;"}).addStyleClass("RightMargin"),
		            	           	this._oRoleExtra
		            	          ]})
		              ]
	   });
	   
	   
	   //hobby
	   this._aHobby = saa.model.Master.getHobbyList();
	   title = new sap.ui.commons.Label({text: "Hobby"});
	   var matrixHobby = this.createMatrixControl(this._aHobby, 6, this._aHobbyCheckbox);
	   
	   this._oHobbyExtra = new sap.ui.commons.TextArea({rows: 1, width:extraAreaWidth});
	   
	   var panelHobby = new sap.ui.commons.Panel({
		   title: new sap.ui.commons.Title({text: "Hobby"}), 
		   content: [ matrixHobby, 
		              new sap.ui.commons.layout.HorizontalLayout({
		            	  content:[ new sap.ui.commons.Label({text: "Others: Seperate by ;"}).addStyleClass("RightMargin"),
		            	           	this._oHobbyExtra
		            	          ]})
		              ]
	   });
	   
	   
	   //expertise
	   this._aExpertise = saa.model.Master.getExpertiseList();
	   var matrixExpertise = this.createMatrixControl(this._aExpertise, 6, this._aExpertiseCheckbox);
	   
	   this._oExpertiseExtra = new sap.ui.commons.TextArea({rows:1, width:extraAreaWidth});
	   
	   var panelExpertise = new sap.ui.commons.Panel({
		   title: new sap.ui.commons.Title({text: "Expertise"}), 
		   content: [ matrixExpertise, 
		              new sap.ui.commons.layout.HorizontalLayout({
		            	  content:[ new sap.ui.commons.Label({text: "Others: Seperate by ;"}).addStyleClass("RightMargin"),
		            	           	this._oExpertiseExtra
		            	          ]})
		   			]
	   });
	   
	
	   //main 
	   
	   var mainLayout = new sap.ui.commons.layout.VerticalLayout(
		  {content:[ panelBasic, panelProfile, panelRole, panelHobby , panelExpertise]}	   
	   );
	   
	   this.addContent( mainLayout );
	   
	   
	   //then add two button, 
	   this._oUpdateBtn = new sap.ui.commons.Button({text:"Update"});
	   this._oUpdateBtn.attachPress( this.onUpdatePressed, this);
	   
	   var  that = this;
	   this._oCancelBtn = new sap.ui.commons.Button(
			   {
				   text:"Cancel",
				   press: function() {
					   that.close();
				   }
				});
	   
	   this.addButton(this._oUpdateBtn);
	   this.addButton(this._oCancelBtn);
	   
   },
   
   /**
    * From the screen get the value by checkbox list and extra edit box
    * @param type
    */
   getPropertyByType: function( type) {
	   var aCheckBox, oExtra;
	   switch (type) {
	   	case saa.Prop.Role: 
		   aCheckBox = this._aRoleCheckbox;
		   oExtra    = this._oRoleExtra;
	   		break;
	   	case saa.Prop.Hobby: 
		   aCheckBox = this._aHobbyCheckbox;
		   oExtra    = this._oHobbyExtra;
	   		break;
	   	case saa.Prop.Expertise: 
		   aCheckBox = this._aExpertiseCheckbox;
		   oExtra    = this._oExpertiseExtra;
	   		break;
	   }
   
	   var ret = "";
	   //first get values by checkbox
	   for (var i=0; i<aCheckBox.length; i++) {
		   if ( aCheckBox[i].getChecked()) {
			   ret += aCheckBox[i].getText() + ";";
		   }
	   }
	   
	   //??later need check whether has the duplicate values
	   ret += oExtra.getValue().trim();
	   //remove the last ; if there
	   
	   ret = ret.trim();
	   if ( ret.substr(-1) ==";")
		   ret = ret.substr(0,  ret.length-1);
	   
	   return ret;
	   
   },

   onUpdateSucc: function(mProp) {
	   alert("Update Information successful!");
	   this.close(); 

	   //As no need update the ID, so here can delete
	   //delete mProp['ID'];
	   delete mProp['keys'];
 
	   
	   //As some value changed, so here need inform the other view
	   var bus = sap.ui.getCore().getEventBus();
	   bus.publish('main','employPropChanged', mProp);
   },
   
   onUpdateFail: function(err) {
	   alert("Update failed:\r\n" +  err);
	   this.close();
   },
   
   //??Later only when really change some value will do change, now just do it
   onUpdatePressed: function() {
	   var newProp = {};
	   
	   newProp.Profile = this._oProfileCtrl.getValue().trim();
	   newProp.Role = this.getPropertyByType( saa.Prop.Role);
	   newProp.Hobby = this.getPropertyByType( saa.Prop.Hobby);
	   newProp.Expertise = this.getPropertyByType( saa.Prop.Expertise);
	   
	   
	   //for the basic information, just use a loop
	   for (var i=0; i<this._mBasic.length; i++) {
		   var ctrl = this._mBasic[i].ctrl;
		   var key = this._mBasic[i].key;

		   newProp[ key] = ctrl.getValue();
	   }

	   
	   
	   //check with the old, only when changed, then will do update
	   var keys = ['Profile', 'Role', 'Hobby', 'Expertise'];
	   for (var i=0; i<keys.length; i++) {
		   var k = keys[i];
		   if ( this._oEmploy[ k ] == newProp[k]) {
			   delete newProp[k];
		   }
	   }
	   
	   var needUpdate = false;
	   //then do update
	   for (var k in newProp) {
		   needUpdate = true;
		   break;
	   }
	   
	   if ( needUpdate ) {
		   newProp.ID = this._oEmploy.ID;
		   saa.model.OrganizationMng.updateEmployProperty( newProp, false,this.onUpdateSucc, this.onUpdateFail, this, newProp );
	   }
   },
   
   
   
   /**
    * aText: the list of text for controls
    * colNum: how many cols
    * retCtrls: the return cols
    * @return:  the control --matrixLayout 
    */
   createMatrixControl: function( aText, colNum, retCtrls) {
	   
	   //get width percentage
	   var widthPercentage = 100 /colNum + "%";
	   var widthStr = [];
	   for (var i=0; i<colNum; i++) {
		   widthStr.push(widthPercentage);
	   }
	   var oMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
			layoutFixed : true,
			columns : colNum,
			width : "100%",
			widths: widthStr,	
		});
	   
	   var iCount=0;
	   var rowCount = Math.floor( (aText.length + colNum-1) / colNum);
	   
	   for (var iRow =0; iRow< rowCount; iRow++) {
		   var row = new sap.ui.commons.layout.MatrixLayoutRow({ /*height: '40px'*/});
		   oMatrixLayout.addRow(row);
		   
		   for (var iCol =0;  iCol< colNum; iCol++ ) {
			   var cell = new sap.ui.commons.layout.MatrixLayoutCell({ hAlign:sap.ui.commons.layout.HAlign.Left});
			   row.addCell(cell);
			   
			   var oCtrl = new sap.ui.commons.CheckBox( {text: aText[iCount]});
			   retCtrls.push(oCtrl);
			   cell.addContent(oCtrl);
			   
			   iCount++;
			   if (iCount == aText.length)
				   break;
		   }
	   }
	   return oMatrixLayout;
   },	
   
   _oEmploy: null,
   
   //edit the profile, now juse use TextArea
   _oProfileCtrl: null,
   
   _aHobby: null,
   _aHobbyCheckbox: [],
   _oHobbyExtra: null,
   
   _aRole: null,
   _aRoleCheckbox: [],
   _oRoleExtra: null,
   
   _aExpertise: null,
   _aExpertiseCheckbox: [],
   _oExpertiseExtra: null,
   
   _oUpdateBtn: null,
   _oCancelBtn: null,
   
   _mBasic: [
  		   { key : 'Phone', 	name:  'Phone',  		ctrl: null},
  		   { key : 'Mobile' ,	name:  'mobile',  		ctrl: null},
  		   { key : 'Name2' ,	name:  'Chinese Name',  ctrl: null},
  			{ key : 'Address',  name:  'Address',  		ctrl: null}
  	   ],
});