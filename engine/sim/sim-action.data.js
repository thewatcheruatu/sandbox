'use strict';

/*
 * Sim Action Data
 */

const simActions = {
	'1' : { simId : 1, actionId : 1, started : 0 },
	'2' : { simId : 2, actionId : 1, started : 0 },
};

const Data = ( function SimData() {
	function select( simId, actionId, db ) {
		return Promise.resolve( simActions[simId] );
	}

	function selectMany( simId, db ) {
		let actions = [];
		actions.push( simActions[simId] );
		return Promise.resolve( actions );
	}

	function update( simAction, db ) {
		return Promise.resolve( true );
	}

	return {
		select : select,
		selectMany : selectMany,
		update : update,
	};
} )();

module.exports = Data;
