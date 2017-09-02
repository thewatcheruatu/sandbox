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
			const wd = WrappedDatabase;
			const self = Object.create( pgp( dbConfig ) );
			const proto = Object.getPrototypeOf( self );
			
			for ( let i = 0; i < wd.methodsWithParams.length; i++ ) {
				const methodName = wd.methodsWithParams[i];
				Object.defineProperty( self, methodName, {
					value : function() {
						return proto[methodName].apply( this, arguments )
							.then( function() {
								if ( arguments.length ) {
									arguments[0] = wd.propsToCamel( arguments[0] );
									return Promise.resolve( arguments[0] );
								}
								return Promise.resolve();
							} )
							.catch( ( _error ) => {
								return Promise.reject( _error );
							} );
					},

					writable : true,
				} );
			}

			return self;
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
			return WrappedDatabase.propsTransform( thing, snakeToCamel );
		},

		propsToSnake : function( thing ) {
			return WrappedDatabase.propsTransform( thing, camelToSnake );
		},

		propsTransform : function( thing, method ) {
			let newThing;

			if ( Array.isArray( thing ) ) {
				newThing = [];

				for ( let i = 0; i < thing.length; i++ ) {
					newThing[i] = WrappedDatabase.propsTransform( thing[i], method );
				}
			} else {
				newThing = {};

				for ( let propName in thing ) {
					const transformed = method( propName );
					newThing[transformed] = thing[propName]
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
