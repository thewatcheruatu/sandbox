'use strict';

const VariableHelpers = ( function() {
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

	return {
		camelToSnake : camelToSnake,
		snakeToCamel : snakeToCamel
	};
} )();

module.exports = VariableHelpers;
