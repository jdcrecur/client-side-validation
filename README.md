# client-side-validation
Client side validation script.


The idea with this script is to standardise the form validation accross a site without relying on the browser html form validation. 

Example, a simple form using the form_validate and blur checks. Note the standardise and validate functions on the parent of the form input. Should the validation fail then if no custom error function is passed the form_validate.generic_error_add is called.:
	  
	  
<h1>The HTML</h1>
	  
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

<h1>The JS</h1>
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
