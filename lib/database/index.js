'use strict';

const pgp = require( 'pg-promise' )();
const VariableHelpers = require( '../helpers/variable-helpers.js' );
const camelToSnake = VariableHelpers.camelToSnake;
const snakeToCamel = VariableHelpers.snakeToCamel;

const db = ( function() {
	const brokerMainConfig = require( './broker.config.js' );
	const gamerInfoConfig = require( './gamer-info.config.js' );

	const WrappedDatabase = {
		init : function( dbConfig ) {
			const wd = Object.create( pgp( dbConfig ) );
			const proto = Object.getPrototypeOf( wd );
			
			console.log( 'wd', wd );
			Object.defineProperty( wd, 'one', {
				value : function() {
					if ( arguments.length >= 1 ) {
						let _data = arguments[1];
						for ( let propName in _data ) {
							_data[camelToSnake( propName )] = _data[propName];
						}
					}
					return proto.one.apply( this, arguments )
						.then( function() {
							if ( arguments.length ) {
								arguments[0] = WrappedDatabase.propsToCamel( arguments[0] );
							}
							return Promise.resolve( arguments[0] );
						} )
						.catch( ( _error ) => {
							return Promise.reject( _error );
						} );
				},

				writable : true,
			} );

			return wd;
		},

		methodsWithParams : [
			'query',
			'none',
			'one',
			'oneOrNone',
			'manyOrNone',
			'any'
		],

		propsToCamel : function( thing ) {
			let newThing;

			if ( Array.isArray( thing ) ) {
				newThing = [];

				for ( let i = 0; i < thing.length; i++ ) {
					newThing[i] = propsToCamel( thing[i] );
				}
			} else {
				newThing = {};

				for ( let propName in thing ) {
					const cameled = snakeToCamel( propName );
					newThing[cameled] = thing[propName]
				}
			}

			return newThing;
		},
	};

	const brokerMainDb = WrappedDatabase.init( brokerMainConfig );
	const gamerInfoDb = WrappedDatabase.init( gamerInfoConfig );

	return {
		brokerMainDb : brokerMainDb,
		gamerInfoDb : gamerInfoDb
	};
} )();

module.exports = db;
