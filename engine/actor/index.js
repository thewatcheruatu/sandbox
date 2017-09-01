'use strict';

/*
 * Actor
 * This is an abstract class, so it shouldn't ever really be instantiated
 */

const GameModel = require( '../game-model' );

const Actor = GameModel.extend( function() {
	const definitions = {
		aName : { type : 'string', constant : true, },
	};
	this.setAllPropDefs( definitions );
	//this.setAllDefined( definitions, props );
} );

module.exports = Actor;
