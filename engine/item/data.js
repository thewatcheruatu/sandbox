'use strict';

const Data = ( function ItemData() {
	function select( itemId, db ) {
		let params;
		let query;

		params = { itemId : itemId };
		query = 'select * from item where item_id = ${itemId}';
		return db.one( query, params );
	}

	function selectAll( criteria, db ) {
		// Criteria not currently used
		let query;

		query = 'select * from item';
		return db.many( query );
	}

	return {
		select : select,
		selectAll : selectAll,
	};
} )();

module.exports = Data;
