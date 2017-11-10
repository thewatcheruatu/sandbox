'use strict';

/*
 * GameModel
 * This is a base class from which basically any other class should be built
 */

const GameModel = {

	extend : function( initializers ) {
		let className;
		let propDefs;
		let initFunction;

		if ( typeof initializers === 'function' ) {
			initFunction = initializers;
		} else {
			className = initializers.className;
			propDefs = initializers.propDefs;
			initFunction = initializers.init;
		}

  	const model = this.make();
    model.init = function() {
    	Object.getPrototypeOf( model ).init.apply( this, arguments );
			this.setAllPropDefs( propDefs );
			if ( className ) {
				this.set( 'class', className );
			}
			//this.setAll( arguments[0] );
      initFunction.apply( this, arguments );
			return this;
    }
    
    return model;
  },
  
  init : function() {
  	// Property assignments go here
    const props = {};
		const classStack = [];
		this.propDefs = {};
    
    this.get = function( propName ) {
			if ( propName === 'class' ) {
				return classStack[classStack.length - 1];
			}
      return props[propName];
    };

		this.propsOut = function() {
			let out = {};

			for ( let propName in props ) {
				if ( 
					typeof this.propDefs[propName] !== 'undefined' && 
					! this.propDefs[propName].private ) {
					out[propName] = props[propName];
				}
			}

			return out;
		};
    
    this.set = function( propName, value ) {
			if ( propName === 'class' && classStack.indexOf( propName ) === -1 ) {
				classStack.push( value );
				return;
			}
			const def = this.propDefs[propName];
			let isNumber = false;

			if ( typeof def === 'undefined' ) {
				console.log( 'property does not exist', propName );
				return false;
			}

			if ( def.constant && typeof props[propName] !== 'undefined' ) {
				console.log( 'already defined it -- sorry', propName );
				return false;
			}

			switch( def.type ) {
			case 'array' :
				value = typeof value === 'string' ? JSON.parse( value ) : value;
				break;
			case 'boolean' :
				// probably nothing
				break;
			case 'integer' :
				value = parseInt( value, 10 );
				isNumber = true;
				break;
			case 'float' :
				value = parseFloat( value );
				isNumber = true;
				if ( typeof def.scale !== 'undefined' ) {
					const multiplier = Math.pow( 10, def.scale );
					value = Math.round( value * multiplier ) / multiplier;
				}
				break;
			case 'string' :
				value = String( value );
				break;
			}

			if ( isNumber ) {
				if ( typeof def.max !== 'undefined' && value > def.max ) {
					value = def.max;
				} else if ( typeof def.min !== 'undefined' && value < def.min ) {
					value = def.min;
				}
			}
      props[propName] = value;
    };

		this.setAll = function( props ) {
			for ( let propName in props ) {
				this.set( propName, props[propName] );
			}
		};

		this.setIncrease = function( propName, amount ) {
			this.set( propName, this.get( propName ) + amount );
		};

		this.set( 'class', 'GameModel' );

		return this;
  },

	make : function() {
		const model = Object.create( this );
		
		return model;
	},

	setAllDefined : function( definitions, props ) {
		for ( let propName in definitions ) {
			if ( typeof props[propName] !== 'undefined' ) {
				this.set( propName, props[propName] );
			}
		}
	},
  
	setAllPropDefs : function( definitions ) {
		for ( let propName in definitions ) {
			this.setPropDef( propName, definitions[propName] );
		}
	},

  setPropDef : function( propName, definition ) {
		this.propDefs = this.propDefs || {};
    this.propDefs[propName] = definition;
		this.propDefs[propName].private = definition.private || false;
		this.propDefs[propName].constant = definition.constant || false;
	},

	// Legacy Compatibility
	propsDefine : function( definitions ) {
		const model = Object.create( this );
		model.setAllPropDefs( definitions );

		return model;
	},

};

module.exports = GameModel;
