'use strict';
/*
 * Sim Engine
 */

const Actor = require( '../actor' );
const Data = require( './index.data.js' );
const GameModel = require( '../game-model' );
const SimAction = require( './sim-action.js' );

const Sim = Actor.extend( {
	className : 'Sim',

	propDefs : {
		simId : { type : 'integer' },
		born : { type : 'integer' }, // Turn number
		checked : { type : 'integer' }, // Timestamp of last check
		hunger : { type : 'integer', max : 1000, min : 0 },
		exhaustion : { type : 'integer' },
	},

	init : function( props ) {
		const self = this;
		/*
		 * Motives:
		 * * Hunger
		 * * Exhaustion
		 */

		this.setAll( props );

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
} );

function loadActions( simId, db ) {
	return new Promise( ( resolve, reject ) => {
		SimAction.loadAll( simId, db )
			.then( ( _simActions ) => {
				resolve( _simActions );
			} )
			.catch( reject );
	} );
}

const StatDelta = GameModel.extend( {
	className : 'StatDelta',

	propDefs : {
		stat : { type : 'string' },
		delta : { type : 'decimal' }, // per minute
	},

	init : function( props ) {
		this.set( 'stat', props.stat );
		this.set( 'delta', props.delta );
	}
} );

const StatMover = GameModel.extend( {
	className : 'StatMover',
	classType : 'abstract',
	
	propDefs : {
		name : { type : 'string' },
	},

	init : function( props ) {
		this.deltas = [];
	},
} );

StatMover.addDelta = function( statDelta ) {
	this.deltas.push( statDelta );

	return this;
}

StatMover.createDelta = function( props ) {
	this.addDelta(
		Object.create( StatDelta ).init( props )
	);

	return this;
};

const Influence = StatMover.extend( {
	className : 'Influence',

	propDefs : {
	},

	init : function( props ) {
		this.setAll( props );
	}
} );

const Action = StatMover.extend( {
	className : 'Action',

	propDefs : {
		actionId : { type : 'integer' },
	},

	init : function( props ) {
		this.setAll( props );
		this.terminateConditions = [];
	}
} );

Action.addTerminateCondition = function( condition ) {
	this.terminateConditions.push( condition );
}

Action.mustTerminate = function( sim ) {
	for ( let i = 0; i < this.terminateConditions.length; i++ ) {
		const _ = this.terminateConditions[i];
		switch ( _.type ) {
		case 'statMin' :
			if ( sim.get( _.stat ) === 0 ) {
				console.log( 'must terminate' );
				return true;
			}
			break;
		}
	}
	return false;
}

Action.terminateOnStatMin = function( stat ) {
	this.addTerminateCondition( {
		type : 'statMin',
		stat : stat,
	} );
}

const eat = Action
	.init( {
		actionId : 2,
	} )
	.createDelta( {
		stat : 'hunger',
		delta : -33.33,
	} )
	.terminateOnStatMin( 'hunger' );

const coreInfluences = [
	Object.create( Influence )
		.init( {
			name : 'digestion',
		} )
		.createDelta( {
			stat : 'hunger',
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
		for ( let j = 0; j < coreInfluences[i].deltas.length; j++ ) {
			const _ = coreInfluences[i].deltas[j];
			const thisMotive = _.get( 'stat' );
			const thisDelta = _.get( 'delta' );
			if ( typeof motiveDeltas[thisMotive] !== 'undefined' ) {
				motiveDeltas[thisMotive] += thisDelta;
			}
		}
	}

	for ( let motive in motiveDeltas ) {
		this.set( motive, sim[motive] += ( motiveDeltas[motive] * diff ) );
	}

	if ( this.get( 'hunger' ) > 500 ) {
		//console.log( 'sim is hungry' );
	}

	this.set( 'checked', gameClock.timestamp );

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
