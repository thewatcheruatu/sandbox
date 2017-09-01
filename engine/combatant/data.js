'use strict';

/*
 * Combatant Data
 */

const combatants = {
	'1' : { combatantId : 1, aName : 'Jon Snow', health : 30, strength : 10, },
	'2' : { combatantId : 2, aName : 'Ramsay Bolton', health : 30, strength : 9, },
};

const Data = ( function CombatantData() {
	function select( combatantId, db ) {
		return Promise.resolve( combatants[combatantId] );
	}

	return {
		select : select,
	};
} )();

module.exports = Data;
