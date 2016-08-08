saa.cfg.Control = {};

saa.cfg.Cfg = {
		onCfgChanged: function( aChangedEvent) {

	         $.each(saa.cfg.Cfg._aListener, function(idx,listen) {
					listen.cbFn.call( listen.context, aChangedEvent, listen.cbData);
				});                  
			},

			addChangeListener: function(cbFn, context, cbData) {
			this._aListener.push( new saa.cfg.EventListener(cbFn, context, cbData));
		},
		

		init: function() {
			this.initControlClass();
		},
		
		
		isDesktop: function() {
			return true;
		},
		
		//used for later support both version
		initControlClass:function(){
			if(saa.cfg.Cfg.isDesktop())
			{
				saa.cfg.Control.Button = sap.ui.commons.Button;
				saa.cfg.Control.Text = sap.ui.commons.TextView;
				saa.cfg.Control.SegmentedButton = sap.ui.commons.SegmentedButton;
				saa.cfg.Control.TreeTable = sap.ui.table.TreeTable;
				saa.cfg.Control.Link = sap.ui.commons.Link;
			}
			else
			{
				saa.cfg.Control.Button = sap.m.Button;
				saa.cfg.Control.Text = sap.m.Text;			
				saa.cfg.Control.SegmentedButton = sap.m.SegmentedButton;
				saa.cfg.Control.Link = sap.ui.commons.Link;
				saa.cfg.Control.TreeTable = saa.uilib.TreeTable;
			}
		},
		
		isDemoMode: function() {
			return false;
		},
		
		
		getBaseServiceUrl: function() {
			return this._baseServiceUrl;
		},
		
		/**
		 * 
		 */
		getBaseUrl:  function() {
			return this._baseUrl;	
		},


		getUserName: function() {
			return this._userName;
		},
		
		getPassword: function() {
			return this._passWord;
		},

		
		//==internal function used for event register and notify
		_notifyListener: function(aEvent) {
			$.each(_aListener, function(idx,listen) {
				listen.cbFn.call( listen.context, aEvent, listen.cbData);
			});
		},
		
		_baseServiceUrl: 'http://lt5037.wdf.sap.corp:8063/tmp/saa/saa/',
			
		_baseUrl :  'http://lt5037.wdf.sap.corp:8063/tmp/saa/saa/odata/myservice.xsodata/',
		_userName:	'SYSTEM',
		_passWord:	'Manager125',
		
};
