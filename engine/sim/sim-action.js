'use strict';
/*
 * Sim Action Engine
 */

const GameModel = require( '../game-model' );
const Data = require( './sim-action.data.js' );

const SimAction = GameModel.extend( {
	className : 'SimAction',

	propDefs : {
		simId : { type : 'integer' },
		actionId : { type : 'integer' },
		started : { type : 'integer' }, // timestamp
	},

	init : function( props ) {
		this.set( 'simId', props.simId );
		this.set( 'started', props.started );
		this.set( 'actionId', props.actionId );
	} 
} );

SimAction.load = function( simId, actionId, db ) {
	return new Promise( ( resolve, reject ) => {
		Data.select( simId, actionId, db )
			.then( ( _result ) => {
				resolve( Object.create( SimAction ).init( _result ) );
			} )
			.catch( ( _error ) => {
				// TODO - proper error message
				reject( _error );
			} );
	} );
};

SimAction.loadAll = function( simId, db ) {
	return new Promise( ( resolve, reject ) => {
		Data.selectMany( simId, db )
			.then( ( _results ) => {
				resolve( _results.map( ( _result ) => {
					return Object.create( SimAction ).init( _result );
				} ) );
			} )
			.catch( ( _error ) => {
				// TODO - proper error messages
				reject( _error );
			} );
	} );
};


module.exports = SimAction;
