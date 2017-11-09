'use strict';
/*
 * Sim Engine
 */

const Actor = require( '../actor' );
const Data = require( './index.data.js' );
const GameModel = require( '../game-model' );
const SimAction = require( './sim-action.js' );

const Sim = Actor.extend( 
	{
		simId : { type : 'integer' },
		born : { type : 'integer' }, // Turn number
		checked : { type : 'integer' }, // Timestamp of last check
		hunger : { type : 'integer', max : 1000, min : 0 },
		exhaustion : { type : 'integer' },
	},
	function( props ) {
		const self = this;
		/*
		 * Motives:
		 * * Hunger
		 * * Exhaustion
		 */

		this.set( 'simId', props.simId );
		this.set( 'born', props.born );
		this.set( 'checked', props.checked );
		this.set( 'aName', props.aName );
		this.set( 'hunger', props.hunger );
		this.set( 'exhaustion', props.exhaustion );

		this._actions = [];

		this.loadActions = function( db ) {
			return new Promise( ( resolve, reject ) => {
				loadActions( self.get( 'simId' ), db )
					.then( ( _actions ) => {
						this._actions = _actions;
						resolve( this._actions );
					} )
					.catch( reject );
			} );
		};

	} 
);

function loadActions( simId, db ) {
	return new Promise( ( resolve, reject ) => {
		SimAction.loadAll( simId, db )
			.then( ( _simActions ) => {
				resolve( _simActions );
			} )
			.catch( reject );
	} );
}

const Influence = GameModel.extend( 
	{
		name_ : { type : 'string' },
		motive : { type : 'string' },
		delta : { type : 'decimal' }, // per minute
	},
	function( props ) {
		this.set( 'name', props.name );
		this.set( 'motive', props.motive );
		this.set( 'delta', props.delta );
	}
);

const coreInfluences = [
	Object.create( Influence ).init( {
		name : 'digestion',
		motive : 'hunger',
		delta : 1.66,
	} ),
];

Sim.doTick = function( gameClock ) {
	const sim = this.propsOut();
	const now = gameClock.timestamp;
	const diff = now - sim.checked;

	const motiveDeltas = {
		'hunger' : 0,
	};

	for ( let i = 0; i < coreInfluences.length; i++ ) {
		const _ = coreInfluences[i];
		const thisMotive = _.get( 'motive' );
		const thisDelta = _.get( 'delta' );

		motiveDeltas[thisMotive] += thisDelta;
	}

	for ( let motive in motiveDeltas ) {
		this.set( motive, sim[motive] += ( motiveDeltas[motive] * diff ) );
	}

};

Sim.getAge = function( gameClock ) {
	return gameClock.getDifference( this.get( 'born' ) );
};

Sim.load = function( simId, db )  {
	return new Promise( ( resolve, reject ) => {
		Data.select( simId, db )
			.then( ( _result ) => {
				resolve( Sim.make().init( _result ) );
			} )
			.catch( ( _error ) => {
				// TODO - Add proper error message
				reject( _error );
			} );
	} );
};


Sim.save = function( db ) {
	return new Promise( ( resolve, reject ) => {
		Data.update( this.propsOut(), db );
	} );
}

module.exports = Sim;
