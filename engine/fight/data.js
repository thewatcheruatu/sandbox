'use strict';

const participants = {
	'aaaaa' : {
		'1' : { 
			combatantId : 1, 
			threat : 20, 
			x : 1, 
			y : 1, 
			opponentId : null,
			moving : false,
		},

		'2' : { 
			combatantId : 2, 
			threat : 10, 
			x : 2, 
			y : 10, 
			opponentId : null,
			moving : false,
		},
	},
};

const Data = ( function() {
	function select( fightId, db ) {
		// TODO
		return Promise.resolve( {
			fightId : 'aaaaa',
		} );
	}

	function selectParticipants( fightId, db ) {
		let results;

		results = [];
		for ( let p in participants[fightId] ) {
			results.push( participants[fightId][p] );
		}
		return Promise.resolve( results );
	}

	return {
		select : select,
		selectParticipants : selectParticipants,
	};

} )();

module.exports = Data;
