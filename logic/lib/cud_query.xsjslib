function selectQuery(table, selector, filter){
	var conn = $.db.getConnection();
	var query = "select " + selector + " from " + table;
	var i;
	var entry = {};
	var rows = [];
	var key;
	if(Object.keys(filter).length){
		i = 1;
		for(key in filter){
			if(filter.hasOwnProperty(key)){
				if(i !== 1){
					query += " and ";
				}
				else {
					query  += " where ";	
				}
				i++;
				query += key + "=?";
			}
		}		
	}
	var ps = conn.prepareStatement(query);
	if(Object.keys(filter).length){
		i = 1;
		for(key in filter){
			if(filter.hasOwnProperty(key)){
				if(filter[key] === parseFloat(filter[key])){
					ps.setDouble(i++, filter[key]);
				}
				else if(filter[key] === parseInt(filter[key], 10)){
					ps.setInt(i++, filter[key]);
				}
				else {
					ps.setString(i++, filter[key]);
				}
			}
		}
	}
	var rs= ps.executeQuery();
	var col_count = rs.getMetaData().getColumnCount();
	while(rs.next()){
		entry = {};
		for(i=1;i<=col_count;i++){
			if(rs.getString(i)){
				entry[rs.getMetaData().getColumnLabel(i)]=rs.getString(i).toString();
			}
			else{
				entry[rs.getMetaData().getColumnLabel(i)] = null;
			}
		}				
		rows.push(entry);
	}
	rs.close();
	ps.close();
	conn.close();
	return rows;
}
//the info will return the detail command
function insertQuery(table, entry, info){
	var conn = $.db.getConnection();
	 
	/*
	var key;
	var values = "(";
	var i = 0;
	for(key in entry){		
		if(entry.hasOwnProperty(key)){
			if(i !== 0){
				query += ",";
				values += ",";
			}
			i++;
			query += key;
		}
	}
	values += ")";
	query += ") values " + values;
	*/
	//??as now all is string, so just use easy way 
	//$.response.setBody("query " + query);
	
	
	
	
	var aCol=[], aVal=[];
	var key;
	for ( key in entry) {
		if ( entry.hasOwnProperty(key)) {
			aCol.push(key);
			//the value need use '' enclose
			//if it have  ' then need change to  ''
			aVal.push( "'" + entry[key].replace("'", "''") + "'");	
		}
	}
	
	//now create command
	var cmd = "insert into " + table + '(' + aCol.join(',') + ") values (" + aVal.join(',') + ");"; 
	
	info['cmd']  = cmd;
	
	var ps = conn.prepareStatement(cmd);
	
	
	/*
	for(key in entry){
		if(entry.hasOwnProperty(key)){
			if(entry[key] === parseFloat(entry[key])){
				ps.setDouble(i++, entry[key]);
			}
			else if(entry[key] === parseInt(entry[key], 10)){
				ps.setInt(i++, entry[key]);
			}
			else {
				ps.setString(i++, entry[key]);
			}
		}
	}*/
	ps.execute();
	ps.close();
	conn.commit();
	conn.close();
	return $.net.http.OK;
}

function updateQuery(table, entry, filter){
	var conn = $.db.getConnection();
	var query = "update " + table + " set ";
	var key;
	var i = 1;
	if(Object.keys(entry).length){
		for(key in entry){
			if(entry.hasOwnProperty(key)){
				if(i !== 1){
					query += ",";
				}
				i++;
				if(entry[key] === "CURRENT_TIMESTAMP"){
					query += key + "=" + entry[key];
				}
				else{
					query += key + "=?";
				}
			}
		}
		if(filter){
			query  += " where ";
			i = 1;
			for(key in filter){
				if(filter.hasOwnProperty(key)){
					if(i !== 1){
						query += " and ";
					}
					i++;
					query += key + "=?";
				}
			}
		}
		var ps = conn.prepareStatement(query);
		i = 1;
		var hasTimeStamp;
		for(key in entry){
			if(entry.hasOwnProperty(key)){
				if(entry[key] === "CURRENT_TIMESTAMP"){
					hasTimeStamp = true;
				}
				else if(entry[key] === parseFloat(entry[key])){
					ps.setDouble(i++, entry[key]);
				}
				else if(entry[key] === parseInt(entry[key], 10)){
					ps.setInt(i++, entry[key]);
				}
				else {
					ps.setString(i++, entry[key]);
				}
			}
		}
		for(key in filter){
			if(filter.hasOwnProperty(key)){
				/*if(filter[key] === parseFloat(filter[key])){
					ps.setDouble(i++, filter[key]);
				}
				else if(filter[key] === parseInt(filter[key], 10)){
					ps.setInt(i++, filter[key]);
				}
				else {
					ps.setString(i++, filter[key]);
				}*/
				ps.setString(i++, filter[key]);
			}
		}
		ps.executeUpdate();
		ps.close();
		conn.commit();
		conn.close();		
	}
	return $.net.http.OK;
}

function deleteQuery(table, filter){
	var conn = $.db.getConnection();
	var query = "delete from " + table;
	var key;
	var i = 1;
	if(Object.keys(filter).length){
		i = 1;
		for(key in filter){
			if(filter.hasOwnProperty(key)){
				if(i !== 1){
					query += " and ";
				}
				else{
					query  += " where ";
				}
				i++;
				query += key + "=?";
			}
		}		
		var ps = conn.prepareStatement(query);
		i = 1;
		for(key in filter){
			if(filter.hasOwnProperty(key)){
				if(filter[key] === parseFloat(filter[key])){
					ps.setDouble(i++, filter[key]);
				}
				else if(filter[key] === parseInt(filter[key], 10)){
					ps.setInt(i++, filter[key]);
				}
				else {
					ps.setString(i++, filter[key]);
				}
			}
		}
		ps.executeUpdate();
		ps.close();
		conn.commit();
		conn.close();
	}		
	return $.net.http.OK;
}

