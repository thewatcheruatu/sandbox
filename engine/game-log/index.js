const GameLog = {
	init : function() {
		this.log = [];

		return this;
	},

	add : function( message ) {
		this.log.push( {
			message : message,
		} );

		return this;
	},

	toString : function( options ) {
		let messages = [];

		for ( let i = 0; i < this.log.length; i++ ) {
			messages.push( this.log[i].message );
		}

		return messages.join( '\n' );
	},
};

module.exports = GameLog;
