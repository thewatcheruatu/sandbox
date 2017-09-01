'use strict';

const Data = ( function() {

	const mockTable = {
		'1' : {
			combatantId : 1,
			mainHand : 3,
		},
		'2' : {
			combatantId : 2,
			mainHand : 3,
		},
	};

	function select( combatantId, db ) {
		return Promise.resolve( mockTable[combatantId] );
	}

	return {
		select : select,
	};
} )();

module.exports = Data;
