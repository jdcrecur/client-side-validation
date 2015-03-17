var form_validate = {
	
	/*
	 *Example:
	  HTML format
	<form  action="somescript.php" action="post">
	    <div class="attribute">
			<label>First name<span class="required-field"> *</span></label>
			<div class="input-field" standardise="capitalize_first" validate="not_empty is_max_length:100">
				<input type="text" value="" name="first_name" class="box">
			</div>
			<p class="error-message hide">
				<span class="required-point ir">^</span>Sorry - what is your first name?
			</p>
		</div>

		<!-- NB easiest to have the submit button as a button, else the js has to prevent the default action -->
		<input id="someButton" type"button" name="submit" value="Submit"/>
	</form>

	<script type="text/javascript">
		//JS (should the validation fail then a class of form-error is added to the parent div with class attribute)
		var $form = $(this).closest('form');

		//click event on the form button
		$('#someButton').click(function(){
			form_validate.form_validate( $form, function(){
				//this function will be run if all the validators within the form passed.
				//NB this is also a custom callback, if you do not pass a custom callback then the form will just be submitted instead.
				alert('Great all validators passed. The custom callback does nothing more than just tell you that at the moment');
			});
		});

		//the class can also validate the elements on the fly, simply call the following. This will trigger the validate funciton on each element after the user has blurred focus
		form_validate.element_blur_checks($form);
	</script>
	*/
	
	
	/* README.
	 * The "form_validate" validates via functions defined in '/js/validate_functions.js'
	 *
	 * The class can validate an entire form or individual elements via either of:
	 * 	form_validate.form_validate( formObjectOrSelector, callback )
	 * 	form_validate.element_validate( inputObjectOrSelector, callback )
	 *
	 * Each form_validate && element_validate take either the object or selctor to object in which to parse.
	 *
	 * Each form_validate && element_validate will run if passed a custom callback.
	 * 	NB - form_validate will on no errors submit the form if no custom callback passed.
	 * 
	 * Example form input:  <input type="text" name="username" validate="not_empty"/>
	 * 
	 * Error functions that are applied to individual inputs on fail:
	 * 1 - form_validate.generic_error_add()
	 * 2 - Custom error function can be passed and are applied if present:
	 * 	   form_validate.non_generic_error_add = function(obj){ $(obj).parent().addClass('errors'); }
	 * 	   
	 * Errors functions that remove error classes and functionality:
	 * 1 -  form_validate.generic_error_add_remove()
	 * 2 - Custom error function can be passed and are applied if present:
	 * 	    form_validate.non_generic_error_remove = function(obj){ $(obj).parent().remvoeClass('errors'); }
	 *
	 * Some functions can accept additional params sent seperated via ':' eg:
	 * <input type="" name="username" class="derep-username" validate="is_min_length:5"/>
	 *
	 * All params split on space and run in order eg:
	 * <input type="" name="username" class="derep-username" validate="is_min_length:5 not_negative_int"/>
	*/
	constants: {
		form_pass :           true,
		error_added:          false,
		scrollToViewOffset:   150,
		apply_generic_errors: true,
		scroll_to_error:      true,
		form_selector_id:     false,
		form_selector_string: false,
		animation_time:       500
	},
	variables: {
		validators_in_progress: 0,
		error_applied: false
	},
	constants_reset: function(){
		form_validate.constants.form_pass            = true;
		form_validate.constants.error_added          = false;
		form_validate.constants.scrollToViewOffset   = 150;
		form_validate.constants.apply_generic_errors = true;
		form_validate.constants.scroll_to_error      = true;
		form_validate.variables.validators_in_progress = 0;
	},
	dont_scroll: function(){
		form_validate.constants.scroll_to_error = false;
	},
	dont_apply_generic_error: function(){
		form_validate.constants.scroll_to_error = false;
	},
	set_form_selector_string: function( formObject ){
		if( !form_validate.form_selector_id ){
			//set the params
			var formSelectorId = (new Date()).getTime(),
				formSelector   = 'form[form_validate_id='+formSelectorId+']';
				form_validate.form_selector_string = '' + formSelector + ' select, ' +
                                                                formSelector + ' input[type=text], ' +
																formSelector + ' input[type=email], ' +
                                                                formSelector + ' input[type=checkbox], ' +
                                                                formSelector + ' textarea, ' +
                                                                formSelector + ' input[type=hidden], ' +
                                                                formSelector + ' input[type=password]';
									
			//add the unique id as a custom attr to the form we are working with
			$(formObject).attr('form_validate_id', formSelectorId);
		}
	},
	
	correct_control: function( params ){
		if( params.formObj && params.new_control ){
			$(params.formObj).find('input[name=control]').val( params.new_control );
		}
		if( params.callback ){
			params.callback();
		}
	},
	
	form_validate: function( formObjectOrSelector, callback ){
		
		//ensure we have the object
		if( typeof formObjectOrSelector == 'string' )
        {
			formObjectOrSelector = $(''+formObjectOrSelector+'');
		}
		//if no callback passed
		callback = callback || false;
		
		//ensure the form_selector_string is set
		form_validate.set_form_selector_string( formObjectOrSelector );
		
		//reset the form_pass to true on each run as this object can be run multiple times without page reload
		form_validate.constants.form_pass = true;
		form_validate.constants.error_added = false;
		
		//count elements to check
		var elementCount = $(''+form_validate.form_selector_string+'').length;
		//check each element and submit form if needed
		$(''+form_validate.form_selector_string+'').each(function(i){
			//standardise and validate the input
			form_validate.standardise_element_functions(this, function(j){

				if( (i + 1) == elementCount ){
					form_validate.form_success(callback, $(''+form_validate.form_selector_string+''));
				}
			});
		});
	},
	form_success: function( callback, $form ){
		callback = callback || false;
		if( form_validate.variables.validators_in_progress == 0 ){
			if( form_validate.constants.form_pass ){
				if( callback ){
					callback();
				} else {
					$form.submit();
				}
			}
			form_validate.constants_reset();
		} else {
			setTimeout(function(){
				form_validate.form_success(callback, $form);
			},100);
		}
	},
	
	element_blur_checks: function(parmas){
		parmas = parmas || {};
		var formObjectOrSelector = parmas.form;
		//ensure we have the object
		if( typeof formObjectOrSelector != 'object' ){
			formObjectOrSelector = $(''+ formObjectOrSelector +'');
		}
		//ensure the form_selector_string is set
		form_validate.set_form_selector_string( formObjectOrSelector );
		$(''+form_validate.form_selector_string+'').unbind('blur').blur(function(){
			//track blur events
			if( parmas.eventTracking ){
				//add your tracking code here
			}
			form_validate.element_validate(this);
		});
	},

	element_validate: function( inputObjectOrSelector, callback ){
		//ensure we have the object
		if( typeof inputObjectOrSelector != 'object' )
        {
			inputObjectOrSelector = $(''+ inputObjectOrSelector +'');
		}
		//reset the form_pass to true on each run as this object can be run multiple times without page reload
		form_validate.constants.form_pass   = true;
		form_validate.constants.error_added = false;
		//standardise and validate the input
		form_validate.standardise_element_functions( inputObjectOrSelector, function(){
			if( form_validate.form_pass ){
				if( callback ){
					callback();
				}
			}
			form_validate.constants_reset();
		});
	},
	
	non_generic_error_add: false,
	
	non_generic_error_remove: false,
	
	generic_error_add: function( params ){
		params = params || {};
		//add form error to the parent .attr and build the error message
		$(params.object).closest('.attribute').addClass( 'form-error' );
		var errorBox = $(params.object).closest('.attribute').find('.error-message');
        
		//remove any success stuff
		form_validate.generic_success_remove( params );
		/*
			object:    obj,
			validator: selector[0],
			custom:    a custom response from ajax
			
			Check for occurence of custom, if it's there, we replace the html of the error with the custom message whiles adding an attribute of the validator for the old error message.
			If custom is not there, check if there is an attribute error and add that
		*/
        if (params.custom != null)
        {
            //only save old msg if the default hasn't been saved yet. Add a default saved attribute to spot this. And then display custom error
            if(!$(params.object).parent().attr('default_saved'))
            {
                //make sure there isn't already a saved message for this validator and that the error box isn't empty
                if(!$(params.object).parent().attr(params.validator) && $(errorBox).html() != '')
                {
                    $(params.object).parent().attr(params.validator, $(errorBox).html());
                    $(params.object).parent().attr('default_saved');
                }
            }
            $(errorBox).html(params.custom.msg);
            //if the custom error is for a pass, remove the red border, else keep it on
            if(params.custom.pass === true)
            {
                $(params.object).closest('.attribute').removeClass( 'form-error' );
            }
        }
        else
        {
            if( $(params.object).hasClass( params.validator ) )
            {
                if( $(params.object).hasAttribute(params.validator) ){
                    //set the html of the error box to be the same as the said html attribute
                    $(errorBox).html( $(params.object).attr(params.validator)  )
                }
            }
            else
            {
                var validatingParent = $(params.object).closest('*['+params.validator+']');
                if( $(validatingParent).hasAttribute(params.validator) ){
                    //set the html of the error box to be the same as the said html attribute
                    $(errorBox).html( $( validatingParent ).attr(params.validator)  )
                }
            }
        }
		
		$(errorBox).fadeIn( form_validate.constants.animation_time, function(){
			setTimeout(function(){
				form_validate.generic_error_remove({ object: $(params.object).closest('.attribute') });
			}, 2500);
		});
	},
	
	generic_error_remove: function(params){
		
		//remove form error to the parent attr
		$(params.object).closest('.attribute').removeClass( 'form-error' ).animate(
						{	'margin-bottom': 0},
						{ 	queue: false,
							duration: form_validate.constants.animation_time  }
					);
		$(params.object).closest('.attribute').find('.error-message').fadeOut( form_validate.constants.animation_time );
	},
	
	generic_success_add: function( params ){
		$(params.object).closest('.attribute').addClass('success');
	},
	generic_success_remove: function( params ){
		$(params.object).closest('.attribute').removeClass('success');
	},
	
	get_validate_strings: function( obj, find_string ){
		var string = false;
		if( $(obj).is('['+find_string+']') )
        {
			string = $(obj).attr(''+find_string+'');
		}
        else
        {
			var parentValidate = $(obj).closest('*['+find_string+']');
			if( parentValidate.length > 0)
            {
				string = $(parentValidate).attr(''+find_string+'');
			}
		}
		return string;
	},
	
	standardise_element_functions: function( obj, callback ){
		var standardise_functions = this.get_validate_strings(obj, 'standardise');
		if( standardise_functions )
        {
			standardise_functions = standardise_functions.split(' ');
			
			for( var i = 0 ; i < standardise_functions.length ; i++ )
            {
				var selector = standardise_functions[i].split(':');
				if( form_validate.standardise_functions[selector[0]] )
                {
					form_validate.standardise_functions[selector[0]]( obj, selector[1] );
				}
			}
			
			this.apply_element_validators( obj, callback );
		}
        else
        {
			this.apply_element_validators( obj, callback );
		}
	},
	
	apply_element_validators: function( obj, callback ){
		var validate_functions = this.get_validate_strings(obj, 'validate');
		if( validate_functions )
        {
			validate_functions = validate_functions.split(' ');
			//set the value to check against into the value_to_check
			form_validate.validate_functions.value_to_check = $(obj).val();
			
			var el_error = false;
			
			for( var i=0; i<validate_functions.length; i++ ){
				
				
				var lastValidator = ( validate_functions.length == ( i + 1 ) ) ? true: false;
				//splitting out any paramters from the function
				var selector = validate_functions[i].split(':');
				
				//splitting out any misc functions from the validator function
				var misc_function = selector[0].split('|');
				if( misc_function.length > 1 ){
					selector = [misc_function[0]];
					misc_function = misc_function[1];
				}
				
				//if the validator exists
				if( form_validate.validate_functions[selector[0]] )
                {
					//set in progress flag, this must be inside the check to see if the validator actually exists
					++form_validate.variables.validators_in_progress;
					log('validator in progress: '+selector[0]+' ' + i);
				
					if( typeof form_validate.validate_functions[selector[0]] == 'object')
                    {
						switch( form_validate.validate_functions[selector[0]]['type'] )
                        {
                            /*
                                If returning a custom response it needs to be an object in the format:
                                [pass: true/false,
                                 msg:  => "custom error message"]
                            */
							case 'ajax':
								form_validate.validate_functions[selector[0]]['validator']( selector[1], obj, function(passFail){
                                    var addResponse = null;
                                    if (passFail instanceof Object)
                                        addResponse = passFail;
									
                                    if(passFail == true)
                                    {
										if(!el_error){
											form_validate.remove_errors(obj, selector[0]);
										}
                                    }
									else 
                                    {
										if(!el_error){
											form_validate.apply_errors(obj, selector[0], addResponse);
											el_error = true;
										}
									}
									--form_validate.variables.validators_in_progress;
									log('validator finished: '+selector[0]+' ' + i);
								});
							break;
							case 'misc':
								functionToCall = toolbox.get_object_from_path( misc_function );
								form_validate.validate_functions[selector[0]]['validator']( selector[1], obj, functionToCall, function(passFail){
                                    var addResponse = null;
                                    if (passFail instanceof Object)
                                        addResponse = passFail;
                                    if(passFail == true)
                                    {
										if(!el_error){
											form_validate.remove_errors(obj, selector[0], lastValidator);
										}
                                    }
									else 
                                    {
										if(!el_error){
											form_validate.apply_errors(obj, selector[0], addResponse);
											el_error = true;
										}
									}
									--form_validate.variables.validators_in_progress;
									log('validator finished: '+selector[0]+' ' + i);
								});
							break;
						}
					}
                    else
                    {
						/*
                             Checking to see if a custom response was returned to us
                             If returning a custom response it needs to be in the format:
                             ['pass' => true/false,
                              'msg'  => "custom error message"]
                        */
                        var custom_response = form_validate.validate_functions[selector[0]]( selector[1], obj ),
                            addResponse = null;
                            
                        if (custom_response instanceof Object)
                            addResponse = custom_response;
                        
                        //if the validate function returns true then it is a pass, remove any previous errors
						if(custom_response == true)
                        {
							if(!el_error){
								form_validate.remove_errors(obj, selector[0], lastValidator);
							}
						}
						//else apply the error functions and move on
						else
                        {
							if(!el_error){
								form_validate.apply_errors(obj, selector[0], custom_response);
								//set a flag for this validator on this element so that only the first error for this element is applied
								el_error = true;
							}
							
						}
						--form_validate.variables.validators_in_progress;
						log('validator finished: '+selector[0]+' ' + i);
					}
				}
			}
			callback();
		}
        else
        {
			callback();
		}
	},
	apply_errors: function( obj, validator, custom_msg ){
        var custom = custom_msg || null;
		form_validate.constants.form_pass = false;
		//call the generic functions
		if( form_validate.constants.apply_generic_errors )
        {
			form_validate.generic_error_add({
				object:    obj,
				validator: validator,
                custom:    custom
			});
		}
		/* If we have any custom errors added then apply this too eg:
		 * form_validate.non_generic_error = function(obj){ $(obj).parent().addClass('errors'); }
		 */
		if( form_validate.non_generic_error_add ){
			form_validate.non_generic_error_add({
				object:    obj,
				validator: validator,
                custom:    custom
			});
		}
		if( form_validate.constants.error_added == false ){
			form_validate.constants.error_added = true;
			if( form_validate.constants.scroll_to_error ){
				toolbox.scrollIntoView( obj, form_validate.constants.scrollToViewOffset );
			}
		}
	},
	remove_errors: function( obj, validator, lastValidator ){
		if( form_validate.constants.apply_generic_errors ){
			form_validate.generic_error_remove({
				object: obj,
				validator: validator
			});
		}
		if( form_validate.non_generic_error_remove ){
			form_validate.non_generic_error_remove({
				object: obj,
				validator: validator
			});
		}
		if( lastValidator ){
			form_validate.generic_success_add({
				object: obj,
				validator: validator
			});
		}
	},
	//The list of functions are defined in /js/form_validate.validate_functions.js
	validate_functions : {},
};