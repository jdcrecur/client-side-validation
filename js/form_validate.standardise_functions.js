form_validate.standardise_functions = {
	
	capitalize_first: function( obj, param ){
		var string = $(obj).val();
		string = string.charAt(0).toUpperCase() + string.slice(1);
		$(obj).val( string );
	},
	
	uc_first: function( obj, param ){
		form_validate.standardise_functions.capitalize_first( obj, param );
	},
	
	strtoupper: function( obj, param ){
		var string = $(obj).val();
		string = string.toUpperCase();
		$(obj).val( string );
	},
	
	lowercase_all: function( obj, param ){
		var string = $(obj).val();
		string = string.toLowerCase();
		$(obj).val( string );
	}
};