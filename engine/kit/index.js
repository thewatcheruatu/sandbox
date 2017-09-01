'use strict';

const Data = require( './data.js' );
const GameModel = require( '../game-model' );
const Item = require( '../item' );

const Kit = GameModel.extend( function( props ) {
	const definitions = {
		combatantId : { type : 'integer', },
		mainHand : { type : 'integer', },
	};
	this.setAllPropDefs( definitions );
	this.set( 'combatantId', props.combatantId );
	this.set( 'mainHand', props.mainHand );

	const loadout = {
		mainHand : undefined,
	};

	this.getLocation = function( kitLocation ) {
		return loadout[kitLocation];
	};

	this.setLocation = function( kitLocation, item ) {
		loadout[kitLocation] = item;
	};
} );

// Static Properties
Kit.locations = {
	mainHand : { itemTypes : [ 'weapon' ] },
};
// End Static Properties

Kit.equip = function( kitLocation, item ) {
	// Can it be equipped to the requested slot?
	const locationInfo = Kit.locations[ kitLocation ];

	if ( typeof locationInfo === 'undefined' ) {
		console.log( 'hell no' );
		return;
	}

	const validTypes = locationInfo.itemTypes;
	const itemType = item.get( 'itemType' );

	if ( validTypes.indexOf( itemType ) === -1 ) {
		console.log( 'not a valid item type' );
		return;
	}

	this.setLocation( kitLocation, item );
};

Kit.load = function( combatantId, db ) {
	let kit;

	return new Promise( ( resolve, reject ) => {
		Data.select( combatantId, db )
			.then( ( _result ) => {
				kit = Kit.make().init( _result );
				kit.loadLocation( 'mainHand', db )
					.then( () => {
						resolve( kit );
					} )
					.catch( reject );
			} )
			.catch( ( _error ) => {
				console.log( _error );
				reject( new Error( 'Could not load kit.' ) );
			} );
	} );
};

Kit.loadLocation = function( kitLocation, db ) {
	const kit = this;

	return new Promise( ( resolve, reject ) => {
		if ( kit.getLocation( kitLocation ) ) {
			return resolve( true );
		}
		if ( ! kit.get( kitLocation ) ) {
			return reject( new Error( 'Nothing at this location' ) );
		}
		Item.load( kit.get( kitLocation ), db )
			.then( ( _item ) => {
				this.setLocation( kitLocation, _item );
				resolve( true );
			} )
			.catch( reject );
	} );
};


module.exports = Kit;
