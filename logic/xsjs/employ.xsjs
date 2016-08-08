$.import("tmp.saa.saa.logic.lib", "cud_query");


function doPost(){
	$.response.setContentType="text/plain";
	
	var body = $.request.body.asString();
	var data = JSON.parse(body);
	
	var table = '"SAP_HBA"."SAA::EMPLOY"';
	
	if(data){
		if ( typeof(data) != 'object') {
			$.response.setBody( "Body need be a map object");
			$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
			return;
		}
	
		//now the format will like, so one time need insert multiple line 
		//{"I038394":{"LastName":"Abulizi","FirstName":"Anniwa","Company":"SAP Beijing Software Syst","Phone":"+86 21 6108-3034","Mobile":"+86 13764090558","Office":"PVG03  5.15","ID":"I038394"},
		//"C5190266":{"LastName":"Abuzour","FirstName":"Mahmoud","Company":"Equate Petrochemical Comp","Phone":"","Mobile":"","Office":"","ID":"C5190266"}}
		
		var cntCmd=0, cntSucc=0;
		
		var error = "Insert error\r\n";
		
		for (var id in data) {
			var employ = data[id];
			
			cntCmd++;
			
			var ret = tmp.saa.saa.logic.lib.cud_query.insertQuery(table, employ);
			if(response===$.net.http.OK){
				cntSucc ++;
			} else {
				error += "Error for " + id + "\r\n"
			}
		}
		
		if (cntCmd != cntSucc) {
			$.response.setBody( error );
			$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		} else {
			$.response.setBody( "Successful!);
			$.response.status = $.net.http.OK;
		} 
	} else {
		$.response.setBody("ERROR : No Data provided");
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	}
}


//change some column
function doPut(){
	$.response.setContentType="text/plain";
	
	var body = $.request.body.asString();
	var data = JSON.parse(body);
	
	var table = '"SAP_HBA"."SAA::EMPLOY"';
	var filter = {};
	
	if(data){
		if ( typeof(data) != 'object') {
			$.response.setBody( "Body need be a map object");
			$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
			return;
		}
		
		//now the format will like, so one time need insert multiple line 
		//{"I038394":{"LastName":"Abulizi","FirstName":"Anniwa","Company":"SAP Beijing Software Syst","Phone":"+86 21 6108-3034","Mobile":"+86 13764090558","Office":"PVG03  5.15","ID":"I038394"},
		//"C5190266":{"LastName":"Abuzour","FirstName":"Mahmoud","Company":"Equate Petrochemical Comp","Phone":"","Mobile":"","Office":"","ID":"C5190266"}}
		
		var cntCmd=0, cntSucc=0;
		
		var error = "Inser error\r\n";
		
		for (var id in data) {
			var employ = data[id];
			
			cntCmd++;
			
			filter.ID = id;
			
			var ret = tmp.saa.saa.logic.lib.cud_query.updateQuery(table, employ, filter);
			if(response===$.net.http.OK){
				cntSucc ++;
			} else {
				error += "Error for " + id + "\r\n"
			}
		}
		
		if (cntCmd == cntSucc) {
			$.response.setBody( error );
			$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		} else {
			$.response.setBody( "Successful!);
			$.response.status = $.net.http.OK;
		} 
		
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		
	} else {
		$.response.setBody("ERROR : No Data provided");
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	}
}

switch($.request.method){
case xsruntime.net.http.POST:
				doPost();
				break;
case xsruntime.net.http.PUT:
				doPut();
				break;
case xsruntime.net.http.DEL:
				doDel();
				break;
case xsruntime.net.http.GET:
				doGet();
				break;
default :
			$.response.status=$.net.http.INTERNAL_SERVER_ERROR;
			$.response.setBody("error : TYPE is not supported");
}