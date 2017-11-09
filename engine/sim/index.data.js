'use strict';

/*
 * Sim Data
 */

const sims = {
	'1' : { 
		simId : 1, 
		aName : 'Simulated Person 1', 
		born : -10368000, 
		checked : 0,
		hunger : 0, 
		exhaustion : 0, 
	},
	'2' : { 
		simId : 2, 
		aName : 'Simulated Person 2', 
		born : -10368000, 
		checked : 0,
		hunger : 0, 
		exhaustion : 0, 
	},
};

const Data = ( function SimData() {
	function select( simId, db ) {
		return Promise.resolve( sims[simId] );
	}

	function update( sim, db ) {
		sims[sim.simId] = sim;
		return Promise.resolve( true );
	}

	return {
		select : select,
		update : update,
	};
} )();

module.exports = Data;
