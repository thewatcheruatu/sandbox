'use strict';

/*
 * Item Engine
 */

const Data = require( './data.js' );
const GameModel = require( '../game-model' );

const Item = GameModel.extend( function( props ) {
	const definitions = {
		itemId : { type : 'integer' },
		itemName : { type : 'string' },
		itemType : { type : 'string' },
	};
	this.setAllPropDefs( definitions );
	this.set( 'itemId', props.itemId );
	this.set( 'itemName', props.itemName );
	this.set( 'itemType', props.itemType );
} );

Item.load = function( itemId, db ) {
	let item;
	let props;

	return new Promise( ( resolve, reject ) => {
		Data.select( itemId, db )
			.then( ( _result ) => {
				props = _result;

				switch ( _result.itemType ) {
				case 'weapon' :
					item = Weapon.make();
					return item.loadStats();
					break;
				default :
					item = Item.make();
					break;
				}
				return Promise.resolve( {} );
			} )
			.then( ( _result ) => {
				Object.assign( props, _result );
				item.init( props );
				resolve( item );
			} )
			.catch( ( _error ) => {
				reject( _error );
			} );
	} );
};

const Weapon = Item.extend( function( props ) {
	const definitions = {
		weaponType : { type : 'string' },
		damageHigh : { type : 'integer' },
		damageLow : { type : 'integer' },
	};
	this.setAllPropDefs( definitions );
	this.set( 'weaponType', props.weaponType );
	this.set( 'damageHigh', props.damageHigh );
	this.set( 'damageLow', props.damageLow );
} );

Weapon.getRange = function() {
	const thisType = this.get( 'weaponType' );
	const rangeByType = {
		'one-handed' : 1,
	};
	
	return rangeByType[thisType] ? rangeByType[thisType] : 1;
};

Weapon.loadStats = function() {
	return new Promise( ( resolve, reject ) => {
		// TODO
		resolve( { 
			'weaponType' : 'one-handed',
			'damageHigh' : 10,
			'damageLow' : 5,
		} );
	} );
};

module.exports = Item;
