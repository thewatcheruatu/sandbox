'use strict';

const pgp = require( 'pg-promise' )();

const db = ( function() {
	const brokerMainConfig = require( './broker.config.js' );
	const gamerInfoConfig = require( './gamer-info.config.js' );

	let brokerMainDbBase = pgp( brokerMainConfig );
	let gamerInfoDbBase = pgp( gamerInfoConfig );
	let brokerMainDb = applyWrapper( brokerMainDbBase );
	let gamerInfoDb = applyWrapper( gamerInfoDbBase );

	function applyWrapper( pgpInstance ) {
		let dbMethodsWithParams;
		let newDb;

		dbMethodsWithParams = [
			'query',
			'none',
			'one',
			'oneOrNone',
			'manyOrNone',
			'any'
		];

		newDb = new wrappedDatabase( pgpInstance );
		for ( let i = 0; i < dbMethodsWithParams.length; i++ ) {
			let methodName = dbMethodsWithParams[i];
			
			newDb[methodName] = function() {
				let promise;
				if ( arguments.length >= 2 && typeof arguments[1] === 'object' ) {
					alterPropNames( arguments[1] );
				}
				promise = new Promise( ( resolve, reject ) => {
					newDb.base[methodName].apply( newDb.base, arguments )
						.then( ( _result ) => {
							if ( ! _result ) {
								return resolve();
							}
							resolve( alterPropNames( _result ) );
						} )
						.catch( reject );
				} );

				return promise;
			};
		}

		return newDb;
	}

	function alterPropNames( thing, method ) {
		if ( Array.isArray( thing ) ) {
			for ( let i = 0; i < thing.length; i++ ) {
				thing[i] = alterObjectPropNames( thing[i] );
			}
			return thing;
		}

		return alterObjectPropNames( thing );

		function alterObjectPropNames( object ) {
			let newObject;

			newObject = {};
			method = method || snakeToCamel;

			for ( let propName in object ) {
				let updatedPropName;

				updatedPropName = method( propName );
				newObject[updatedPropName] = object[propName];
			}

			return newObject;
		}
	}

	function camelToSnake( propName ) {
		let newPropName;

		newPropName = propName.replace( /([A-Z])/g, '_$1' );
		newPropName = newPropName.toLowerCase();
		return newPropName;
	}

	function snakeToCamel( propName ) {
		let newPropName;

		newPropName = propName.replace( /(_[a-z])/g, ( a ) => {
			return a.replace( '_', '' ).toUpperCase();
		} );
		return newPropName;
	}

	function wrappedDatabase( baseInstance ) {
		this.base = baseInstance;
		this.connect = this.base.connect;
		this.query = this.base.query;
		this.none = this.base.none;
		this.many = this.base.many;
		this.oneOrNone = this.base.oneOrNone;
		this.any = this.base.any;
		this.result = this.base.result;
		this.stream = this.base.stream;
		this.func = this.base.func;
		this.proc = this.base.proc;
		this.map = this.base.map;
		this.each = this.base.each;
		this.task = this.base.task;
		this.tx = this.base.tx;
	}

	wrappedDatabase.prototype.camelToSnake = camelToSnake;
	wrappedDatabase.prototype.snakeToCamel = snakeToCamel;

	return {
		brokerMainDb : brokerMainDb,
		gamerInfoDb : gamerInfoDb
	};
} )();

module.exports = db;
