'use strict';

/*
 * Fight Participant Engine
 */

const Combatant = require( '../combatant' );
const GameModel = require( '../game-model' );

const Participant = GameModel.extend( function( props ) {
	const definitions = {
		combatantId : { type : 'integer' },
		threat : { type : 'integer' },
		x : { type : 'integer' },
		y : { type : 'integer' },
	};

	this.setAllPropDefs( definitions );
	this.set( 'combatantId', props.combatantId );
	this.set( 'threat', props.threat );
	this.set( 'x', props.x );
	this.set( 'y', props.y );
} );

Participant.loadCombatant = function( db ) {
	const participant = this;

	return new Promise( ( resolve, reject ) => {
		Combatant.load( participant.get( 'combatantId' ), db, { loadKit : true, } )
			.then( ( _combatant ) => {
				participant.combatant = _combatant;
				resolve( true );
			} )
			.catch( reject );
	} );
};

module.exports = Participant;
