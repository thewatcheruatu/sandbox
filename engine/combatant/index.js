'use strict';

const Actor = require( '../actor' );
const Data = require( './data.js' );
const Kit = require( '../kit' );

const Combatant = Actor.extend( function( props ) {
	const definitions = {
		combatantId : { type : 'integer' },
		health : { type : 'integer' },
		strength : { type : 'integer' },
		runSpeed : { type : 'float' },
	};

	this.setAllPropDefs( definitions );
	//this.setAllDefined( definitions, props );
	this.setAll( props );
	this.set( 'runSpeed', 3.0 );

	this.kit;
} );

Combatant.attack = function( opponent ) {
	let damageHigh;
	let damageLow;

	const weapon = this.kit.getLocation( 'mainHand' );
	if ( ! weapon ) {
		damageHigh = 5;
		damageLow = 1;
	} else {
		damageHigh = weapon.get( 'damageHigh' );
		damageLow = weapon.get( 'damageLow' );
	}

	let damage;

	damage = Math.floor(
		Math.random() * ( damageHigh - damageLow + 1 )
	) + damageLow;

	console.log( this.get( 'aName' ) + ' does ' + damage + ' damage.' );
	opponent.takeDamage( damage );
};

Combatant.equip = function( kitLocation, item ) {
	// Does the combatant have the skills to equip this?
	this.kit.equip( kitLocation, item );
};

Combatant.load = function( combatantId, db, options ) {
	let combatant; 

	options = options || {};
	options.loadKit = typeof options.loadKit === 'undefined' ? 
		false : 
		options.loadKit;

	return new Promise( ( resolve, reject ) => {
		Data.select( combatantId, db )
			.then( ( _result ) => {
				combatant = Combatant.make().init( _result );
				if ( options.loadKit ) {
					combatant.loadKit( db )
						.then( () => {
							resolve( combatant );
						} )
						.catch( reject );
					return;
				}
				resolve( combatant );
			} )
			.catch( ( _error ) => {
				reject( 
					new Error( 
						'Could not load combatant ( ID: ' + combatantId + ')'
					)
				);
			} );
	} );
};

Combatant.loadKit = function( db ) {
	const combatant = this;

	return new Promise( ( resolve, reject ) => {
		Kit.load( combatant.get( 'combatantId' ), db )
			.then( ( _kit ) => {
				combatant.kit = _kit;
				resolve( true );
			} )
			.catch( reject );
	} );
};

Combatant.takeDamage = function( damage ) {
	let health;

	health = Math.max(
		this.get( 'health' ) - damage,
		0
	);

	this.set( 'health', health );
	if ( health === 0 ) {
		console.log( this.get( 'aName' ) + ' has died' );
	}
}

module.exports = Combatant;
