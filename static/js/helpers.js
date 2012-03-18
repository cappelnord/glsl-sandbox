
function initialize_compressor() {
	compressor=new LZMA( "js/lzma_worker.js" );
	return compressor;
}

function initialize_helper() {
}

function load_url_code() {
	if ( window.location.hash ) {

		var hash = window.location.hash.substr( 1 );
		var version = hash.substr( 0, 2 );

		if ( version == 'A/' ) {

			// LZMA

			readURL( hash.substr( 2 ) );

		} else {

			// Basic format

			code.value = decodeURIComponent( hash );

		}

	} else {

		readURL( '5d00000100b50300000000000000119a48c65ab5aec1f910f780dfdfe473e599a211a90304ab6aa581b342b344db4e71099beb79352b3c442c8dee970ffb4d054491e356b4f55882c2f3554393fe6662cf2c348a3f51dcce7b5760290bbc5c1b92e7c7ce5ee4bf92b08f16b9a81a20ae0a3feadb43e8f3c6033b0b28806e441c5868c67ecc30fc745f38da2cf96d6265e9ac209f249cdbec52e563f2c40588835df8913854ef436ecc6bb0ff8c980b5a7cdc39f26e758bf2319c0daa2d503cad6a8191946bf35ac04919604a8330729686847306f20e1088f82b74ffa1d24a37d52e256162fdd4e82945674d906b63ff74d1c76349c96d04f8868c4e85dd11cb08f0279d82116838836eef2891e8f259d641bd20d611f4843a4325fa5e2893c772d5250a384beb75f6c85c8c5ab0fb68f01560ca23ab83a6abb63d6ccc28349f13ae9882832cadb4fdc2d416cb20dbf7c32b300a1399591c7d203c2e08f4f72cb380dcbab1e38314735ecf0953298187947461829c75a14e0eda261599a1779b24ce3d9b6bf127fd7381fd564e9bbb6ac5182399b08e9f9fbe0044487646d14b1bd6b4b4c222667b03ae80702c24419ff2d7c14acd2104864fd26ce569f0b9d7f4db9af8cea4e4d43852f3bc734800fee261a3' );

	}
}

function setURL( shaderString ) {

	compressor.compress( shaderString, 1, function( bytes ) {

		var hex = convertBytesToHex( bytes );
		window.location.replace( '#A/' + hex );

	},
	dummyFunction );

}

function readURL( hash ) {

	var bytes = convertHexToBytes( hash );

	compressor.decompress( bytes, function( text ) {

		compileOnChangeCode = false;  // Prevent compile timer start
		code.setValue(text);
		compile();
		compileOnChangeCode = true;

	},
	dummyFunction );

}

function convertHexToBytes( text ) {

	var tmpHex, array = [];

	for ( var i = 0; i < text.length; i += 2 ) {

		tmpHex = text.substring( i, i + 2 );
		array.push( parseInt( tmpHex, 16 ) );

	}

	return array;

}

function convertBytesToHex( byteArray ) {

	var tmpHex, hex = "";

	for ( var i = 0, il = byteArray.length; i < il; i ++ ) {

		if ( byteArray[ i ] < 0 ) {

			byteArray[ i ] = byteArray[ i ] + 256;

		}

		tmpHex = byteArray[ i ].toString( 16 );

		// add leading zero

		if ( tmpHex.length == 1 ) tmpHex = "0" + tmpHex;

		hex += tmpHex;

	}

	return hex;

}

// dummy functions for saveButton
function set_save_button(visibility) {
}

function set_parent_button(visibility) {
}

function add_server_buttons() {
}

