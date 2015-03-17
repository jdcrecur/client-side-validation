form_validate.validate_functions = {
	
	/* REAMDE
	 *
	 * There are three available variables to call within each of th form_validate.validate_functions
	 *
	 * 1 - 'this.value_to_check' or 'form_validate.validate_functions.value_to_check'
	 * 		This holds the value of the input being validated (NB useless for select tags)
	 * 2 - 'param'
	 * 		This is the first parameter passed to all functions, is contains any options params sent to the
	 * 		function via the colon seperated means, eg:
	 * 		<input type="" name="username" class="derep-username" validate="is_min_length:5"/>
	 * 3 - 'obj'
	 * 		This is actual form element object being validated (usefull for select tags)
	 *
	 * NB: The first parameter passed to all validate functions is the colon seperared value: if you only need the object
	 * 		you will still need to declare the first paramter, just do not use it.
	*/
	value_to_check: '',
	not_empty: function( ){
		var returnVal = false;
		if( this.value_to_check != ''){
			returnVal = true;
		}
		return returnVal;
	},
	not_first_option: function( param, obj ){
		var returnVal = false;
		if( $(obj).find('option').first().prop('selected') != true){
			returnVal = true;
		}
		return returnVal;
	},
	not_negative_int: function(){
		var returnVal = false;
		var val = this.value_to_check;
		if( parseInt(val) >= 0 ){
			returnVal = true;
		}
		return returnVal;
	},
	is_alphanumeric_hyphen: function(){
		var returnVal = false,
			pattern = new RegExp(/^[a-zA-Z0-9.-]+$/);
		if( pattern.test( this.value_to_check ) ){
			returnVal = true;
		}
		return returnVal;
	},
	is_alphanumeric_underscore: function(){
		var returnVal = false,
			pattern = new RegExp(/^\w+$/);
		if( pattern.test( this.value_to_check ) ){
			returnVal = true;
		}
		return returnVal;
	},
	is_alphanumeric_hyphen_space_slash_colon: function(){
		var returnVal = false,
			pattern = new RegExp(/^[a-zA-Z0-9./: -]+$/);
		if( pattern.test( this.value_to_check ) ){
			returnVal = true;
		}
		return returnVal;
	},
	is_only_letters: function(){
		var returnVal = false,
			pattern = new RegExp(/^[a-zA-Z]+$/);
		if( pattern.test( this.value_to_check ) ){
			returnVal = true;
		}
		return returnVal;
	},
	is_only_number: function(){
		var returnVal = false;
		if( /^\d+$/.test(this.value_to_check) ){
			returnVal = true;
		}
		return returnVal;
	},
	is_min_length: function( param ){
		var returnVal = false;
		param = parseInt(param);
		if( this.value_to_check.length >= param ){
			returnVal = true;
		}
		return returnVal;
	},
	is_length: function( param ){
		var returnVal = false;
		param = parseInt(param);
		if( this.value_to_check.length == param ){
			returnVal = true;
		}
		return returnVal;
	},
	is_max_length: function( param ){
		var returnVal = false;
		param = parseInt(param);
		if( this.value_to_check.length <= param ){
			returnVal = true;
		}
		return returnVal;
	},
	is_longer_than: function( param ){
		var returnVal = false;
		param = parseInt(param);
		if( this.value_to_check.length > param ){
			returnVal = true;
		}
		return returnVal;
	},
	is_checked: function( param, obj ){
		var returnVal = false;
		if( $(obj).prop('checked') ){
			returnVal = true;
		}
		return returnVal;
	},
	is_same_as: function( param, obj ){
		var returnVal = false;
		param = param || false;
		if( param ){
			if( $(''+param+'').val() == this.value_to_check ){
				returnVal = true;
			}
		}
		return returnVal;
	},
	is_email: function( param ){
		var val = param || false;
		if(!val){
			val = this.value_to_check;
		}
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(val);
	},
	/*
	* Below is an example of a validator with an ajax call. Note the type and validator params.
	* These are required and looked for in the form_validate.apply_element_validators
	* */
    is_unique_email: {
		type: 'ajax',
		validator: function( param, obj, callback ){
			var email = form_validate.validate_functions.value_to_check;
			$.ajax({
				url: 'some-server-script.php',
				type: 'POST',
				data: {
					type:'is_unique_email',
					value: email
				},
				success: function( response ){
					var returnval =  false;
					if (response == '1') {
						returnval =  true;
					}

					return callback(returnval);
				}
			});
		}
	}
};