'use strict';

/*
 * Fight Engine
 */

const Data = require( './data.js' );
const GameModel = require( '../game-model' );
const Participant = require( './participant.js' );

const Fight = GameModel.extend( function( props ) {
	const definitions = {
		fightId : { type : 'string' },
	};

	this.setAllPropDefs( definitions );
	this.set( 'fightId', props.fightId );
} );

Fight.load = function( fightId, db ) {
	let fight;

	return new Promise( ( resolve, reject ) => {
		Data.select( fightId, db )
			.then( ( _result ) => {
				fight = Fight.make();
				fight.init( _result );
				resolve( fight );
			} )
			.catch( ( _error ) => {
				reject( _error );
			} );
	} );
};

Fight.loadParticipants = function( db ) {
	const fight = this;

	return new Promise( ( resolve, reject ) => {
		Data.selectParticipants( fight.get( 'fightId' ), db )
			.then( ( _results ) => {
				fight.participants = _results.map( ( p ) => {
					return Participant.make().init( p );
				} );
				return Promise.all( fight.participants.map( ( p ) => {
					return p.loadCombatant( db );
				} ) );
			} )
			.then( ( r ) => {
				resolve( true );
			} )
			.catch( ( _error ) => {
				reject( _error );
			} );
	} );
};

Fight.distanceBetweenParticipants = function( p1, p2 ) {
	const a = p1.get( 'x' ) - p2.get( 'x' );
	const b = p1.get( 'y' ) - p2.get( 'y' );
	
	return Math.round(
		Math.sqrt(
			Math.pow( a, 2 ) + Math.pow( b, 2 )
		)
	);
};

Fight.doTick = function() {
	const fight = this;

	this.participants.map( ( p ) => {
		// Might need to pass some options at some point--don't know
		return doParticipantTick( p );
	} );

	function doParticipantTick( participant ) {
		const p = Object.assign(
			{},
			participant.propsOut(),
			participant.combatant.propsOut()
		);
		const opponent = fight.getParticipant( p.opponent );
		const o = Object.assign( {},
			opponent.propsOut(),
			opponent.combatant.propsOut()
		);
		if ( fight.opponentInWeaponRange( participant, opponent ) ) {
			console.log( 'in weapon range' );
		} else {
			console.log( 'not in weapon range' );
			fight.moveToWeaponRange( participant, opponent );
			console.log( participant.propsOut() );
		}
	}
};

Fight.doTurn = function() {
	console.log( 'doing turn' );
	this.doTick();
	this.doTick();
	this.doTick();
};

/*
 * Synchronous
 */
Fight.chooseOpponents = function() {
	const fight = this;
	let opponent;
	let maxThreatSeen;

	if ( ! fight.participants ) {
		console.log( 'no participants loaded' );
		return false;
	}

	for ( let i = 0; i < fight.participants.length; i++ ) {
		const participant = fight.participants[i];
		const combatant = participant.combatant;
		const c1 = Object.assign( 
			{}, 
			participant.propsOut(),
			combatant.propsOut()
		);
		c1.attackRange = combatant.kit.getLocation( 'mainHand' ).getRange();
		c1.runSpeed = combatant.get( 'runSpeed' );
		maxThreatSeen = 0;

		for ( let j = 0; j < fight.participants.length; j++ ) {
			if ( j === i ) {
				continue;
			}
			const otherParticipant = fight.participants[j];
			const otherCombatant = otherParticipant.combatant;
			const c2 = Object.assign(
				{},
				otherParticipant.propsOut(),
				otherCombatant.propsOut()
			);
			c2.attackRange = otherCombatant.kit.getLocation( 'mainHand' ).getRange();
			const distance = fight.distanceBetweenParticipants(
				participant,
				otherParticipant
			);
			const distanceToAttack = distance - c1.attackRange;
			const distanceToAttacked = distance - c2.attackRange;
			const turnsToAttacked = Math.ceil( distanceToAttacked / c2.runSpeed );
			const threatProxMod = ( 6 - Math.min( 5, turnsToAttacked ) ) / 6;
			c2.threat *= threatProxMod;
			if ( c2.threat >= maxThreatSeen ) {
				opponent = c2.combatantId;
			}
		}

		fight.participants[i].set( 'opponent', opponent );
	}
	

	return true;
}

Fight.getParticipant = function( combatantId ) {
	for ( let i = 0; i < this.participants.length; i++ ) {
		if ( this.participants[i].get( 'combatantId' ) === combatantId ) {
			return this.participants[i];
		}
	}
};

Fight.getParticipantWeaponRange = function( participant ) {
	const kit = participant.combatant.kit;
	const mainWeapon = kit.getLocation( 'mainHand' );

	return mainWeapon.getRange();
};

Fight.moveToWeaponRange = function( participant, opponent ) {
	const fight = this;
	const weaponRange = fight.getParticipantWeaponRange( participant );
	const p = Object.assign( 
		{},
		participant.propsOut(),
		participant.combatant.propsOut()
	);
	const o = opponent.propsOut();
	const xDist = o.x - p.x;
	const yDist = o.y - p.y;
	const hypotenuse = Math.sqrt( Math.pow( xDist, 2 ) + Math.pow( yDist, 2 ) );
	const sine = yDist / hypotenuse;
	const cosine = xDist / hypotenuse;
	let runDistance = p.runSpeed;
	if ( runDistance >= hypotenuse ) {
		runDistance = hypotenuse - weaponRange;
	}
	const newX = p.x + ( runDistance * cosine );
	const newY = p.y + ( runDistance * sine );
	participant.set( 'x', newX );
	participant.set( 'y', newY );
};

Fight.opponentInWeaponRange = function( participant, opponent ) {
	const fight = this;
	const weaponRange = fight.getParticipantWeaponRange( participant );
	const distance = fight.distanceBetweenParticipants( participant, opponent );

	return distance <= weaponRange;
	
};

module.exports = Fight;
