'use strict';

const bodyParser = require( 'body-parser' );
const CronJob = require( 'cron' ).CronJob;
const express = require( 'express' );
const http = require( 'http' );
const redis = require( 'redis' );
const session = require( 'express-session' );
const sessionConfig = require( './session.config.js' );
const JSend = require( './lib/jsend' );

// Constants with dependencies above
const app = express();
const server = http.Server( app );
const io = require( 'socket.io' )( server );
const RedisStore = require( 'connect-redis' )( session );
const client = redis.createClient();
sessionConfig.store = new RedisStore( {
	host : 'localhost',
	port : 6379,
	client : client,
	ttl : 900 // 15 minutes
} );

app.set( 'trust proxy', 1 );
app.use( session( sessionConfig ) );
app.use( bodyParser.urlencoded( { extended : false } ) );
app.use( JSend );

/*
 * Just toying around with some things here. Loading up a fight and
 * watching a couple of combatants go at it just as a development
 * exercise. This will all be replaced eventually.
 */
const Fight = require( './engine/fight' );

// Sim thing
const Sim = require( './engine/sim' );

const GameClock = ( function() {
	function _init( t ) {
		this.timestamp = t || 0;

		return this;
	};

	function addTime( minutes ) {
		this.timestamp += minutes;
	};

	function convertMinutes( timestamp ) {
		let t = timestamp;
		const years = Math.floor( t / 518400 );
		t %= 518400;
		const months = Math.floor( t / 43200 );
		t %= 43200;
		const days = Math.floor( t / 1440 );
		t %= 1440;
		const hours = Math.floor( t / 60 );
		t %= 60;
		const minutes = t;

		return {
			years : years,
			months : months,
			days : days,
			hours : hours,
			minutes : minutes
		}
	}

	function get() {
		return convertMinutes( this.timestamp );
	}

	function getDifference( timestamp ) {
		const diff = Math.abs( this.timestamp - timestamp );
		return convertMinutes( diff );
	}

	return {
		_init : _init,
		addTime : addTime,
		get : get,
		getDifference : getDifference,
	};
} )();

const gc = Object.create( GameClock )._init();

new CronJob( '*/10 * * * * *', ()=> {
	gc.addTime( 20 );
	//console.log( 'running every 10 seconds', new Date() );
	const db = null;
	let sims;
	let simActions;
	Promise.all( [
		Sim.load( 1, db ),
		Sim.load( 2, db ),
		] )
		.then( async ( _sims ) => {
			sims = _sims;

			return Promise.all( [
				sims[0].loadActions( db ),
				sims[1].loadActions( db ),
			] );
		} )
		.then( () => {
			const simActions = sims[0]._actions;
			sims[0].doTick( gc );
			//_sims[1].doTick();
			//console.log( sims[0].propsOut() );
			//console.log( _sims[1].propsOut() );
			if ( sims[0].getAge( gc ).minutes === 0 ) {
				console.log( sims[0].getAge( gc ) );
			}
			//console.log( simActions[0].propsOut() );
			//console.log( _sims[1].getAge( turn ) );
			//console.log( gc1.get() );
			//console.log( gc2.get() );
			return Promise.all( 
				sims.map( ( _sim ) => {
					_sim.set( 'checked', gc.timestamp );
					_sim.save( db );
				} )
			);
		} )
		.then( () => {
		} )
		.catch( console.log );
}, null, true );

// Testing out socket.io
io.on( 'connection', ( socket ) => {
	const db = require( './lib/database' ).brokerMainDb;
	console.log( 'a user connected' );

/*
	let fight;

	Fight.load( 'aaaaa', db )
		.then( ( _fight ) => {
			fight = _fight;
			return fight.loadParticipants( db );
		} )
		.then( () => {
			fight.chooseOpponents();
			fight.doTurn();
		} )
		.catch( console.log );
*/
} );

/*
app.all( '*', ( request, response, next ) => {
	if ( request.method.toLowerCase() === 'get' ) {
		return next();
	}
	
	// TODO - this is just temporary until I get a better login solution
	if ( request.path === '/app/gamers/session' ) {
		return next();
	}

	const origin = request.get( 'origin' );
	const referrer = request.get( 'referrer' );
	const xRequestedWith = request.get( 'x-requested-with' );

	//console.log( 'origin', request.get( 'origin' ) );
	//console.log( 'referrer', request.get( 'referrer' ) );
	if ( ! origin && ! referrer ) {
		return response.forbidden( new Error( 'Could not verify origin' ) );
	}
	if ( ! xRequestedWith ) {
		return response.forbidden( new Error( 'No cross-domain requests' ) );
	}
	if ( 
		( origin || referrer ).indexOf( 'https://growlfrequency.com' ) !== 0 ||
		xRequestedWith.toLowerCase() !== 'xmlhttprequest'
	) {
		return response.forbidden( new Error( 'Could not verify request. ' ) );
	}
	next();
} );
*/

app.get( '/app/session/check', ( request, response ) => {
	response.success( request.session );
} );

app.get( '/app/session/destroy', ( request, response ) => {
	request.session.destroy( ( _error ) => {
		if ( _error ) {
			return response.error( _error );
		}
		response.success( 'session destroyed' );
	} );
} );

/*
 * Temporary thing for work. Please ignore.
 */
const workThing = require( './tmp/work-thing.js' );
app.get( '/work/feeds/xmlparser/:url', workThing );

server.listen( 3000, () => {
	console.log( 'Example app listening on port 3000!' );
} );
