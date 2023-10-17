"use strict";

// Class definition
var KTSigninGeneral = function() {
    // Elements
    var form;
    var submitButton;
    var validator;

    // Handle form
    var handleValidation = function(e) {
        // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/
        validator = FormValidation.formValidation(
			form,
			{
				fields: {					
					'email': {
                        validators: {
                            regexp: {
                                regexp: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'The value is not a valid email address',
                            },
							notEmpty: {
								message: 'Email address is required'
							}
						}
					},
                    'password': {
                        validators: {
                            notEmpty: {
                                message: 'The password is required'
                            }
                        }
                    },
                    'name': {
                        validators: {
                            notEmpty: {
                                message: 'The name is required'
                            }
                        }
                    },
                    'telephone': {
                        validators: {
                            notEmpty: {
                                message: 'The telephone is required'
                            }
                        }
                    },
                    'city': {
                        validators: {
                            notEmpty: {
                                message: 'The city is required'
                            }
                        }
                    },
                    'address1': {
                        validators: {
                            notEmpty: {
                                message: 'The address is required'
                            }
                        }
                    },
                    'state': {
                        validators: {
                            notEmpty: {
                                message: 'The state is required'
                            }
                        }
                    },
                    'zip': {
                        validators: {
                            notEmpty: {
                                message: 'The zip is required'
                            }
                        }
                    },
                    'username': {
                        validators: {
                            notEmpty: {
                                message: 'The username is required'
                            }
                        }
                    },
                    'confirm_password': {
                        validators: {
                            notEmpty: {
                                message: 'The confirm password is required'
                            },
                            identical: {
                                compare: function() {
                                    return form.querySelector('[name="password"]').value;
                                },
                                message: 'The password and its confirm must be the same'
                            }
                        }
                    },
                
				},
				plugins: {
					trigger: new FormValidation.plugins.Trigger(),
					bootstrap: new FormValidation.plugins.Bootstrap5({
                        rowSelector: '.fv-row',
                        eleInvalidClass: '',  // comment to enable invalid state icons
                        eleValidClass: '' // comment to enable valid state icons
                    })
				}
			}
		);	
    }

    var handleSubmitDemo = function(e) {
        // Handle form submit
        submitButton.addEventListener('click', function (e) {
            // Prevent button default action
            e.preventDefault();

            // Validate form
            validator.validate().then(function (status) {
                if (status == 'Valid') {
                    // Show loading indication
                    submitButton.setAttribute('data-kt-indicator', 'on');

                    // Disable button to avoid multiple click 
                    submitButton.disabled = true;
                    

                    // Simulate ajax request
                    setTimeout(function() {
                        // Hide loading indication
                        submitButton.removeAttribute('data-kt-indicator');

                        // Enable button
                        submitButton.disabled = false;

                        // Show message popup. For more info check the plugin's official documentation: https://sweetalert2.github.io/
                        Swal.fire({
                            text: "You have successfully logged in!",
                            icon: "success",
                            buttonsStyling: false,
                            confirmButtonText: "Ok, got it!",
                            customClass: {
                                confirmButton: "btn btn-primary"
                            }
                        }).then(function (result) {
                            if (result.isConfirmed) { 
                                form.querySelector('[name="email"]').value= "";
                                form.querySelector('[name="password"]').value= "";  
                                //form.submit(); // submit form
                                var redirectUrl = form.getAttribute('data-kt-redirect-url');
                                if (redirectUrl) {
                                    location.href = redirectUrl;
                                }
                            }
                        });
                    }, 2000);   						
                } else {
                    // Show error popup. For more info check the plugin's official documentation: https://sweetalert2.github.io/
                    Swal.fire({
                        text: "Sorry, looks like you missed out some, please try again.",
                        icon: "error",
                        buttonsStyling: false,
                        confirmButtonText: "Ok, got it!",
                        customClass: {
                            confirmButton: "btn btn-primary"
                        }
                    });
                }
            });
		});
    }

    var handleSubmitAjax = function(e) {
        // Handle form submit
        submitButton.addEventListener('click', function (e) {
            // Prevent button default action
            e.preventDefault();

            // Validate form
            validator.validate().then(function (status) {
                if (status == 'Valid') {
                    // Hide loading indication
                    submitButton.removeAttribute('data-kt-indicator');

                    // Enable button
                    submitButton.disabled = false;

                    const data = {
                        'name' : form.querySelector('[name="name"]').value,
                        'email' : form.querySelector('[name="email"]').value,
                        'telephone' : form.querySelector('[name="telephone"]').value,
                        'city' : form.querySelector('[name="city"]').value,
                        'state' : form.querySelector('[name="state"]').value,
                        'address1' : form.querySelector('[name="address1"]').value,
                        'address2' : form.querySelector('[name="address2"]').value,
                        'zip' : form.querySelector('[name="zip"]').value,
                        'username' : form.querySelector('[name="username"]').value,
                        'email' : form.querySelector('[name="email"]').value,
                        'password' : form.querySelector('[name="password"]').value,
                        'confirm_password' : form.querySelector('[name="confirm_password"]').value,
                    }

                    axios.post('/api/register', data)
                    .then(function (response) {
                        console.log(response)
                        if (response) {
                            form.querySelector('[name="name"]').value= "";
                            form.querySelector('[name="email"]').value= "";
                            form.querySelector('[name="telephone"]').value= "";
                            form.querySelector('[name="city"]').value= "";
                            form.querySelector('[name="state"]').value= "";
                            form.querySelector('[name="address1"]').value= "";
                            form.querySelector('[name="address2"]').value= "";
                            form.querySelector('[name="zip"]').value= "";
                            form.querySelector('[name="username"]').value= "";
                            form.querySelector('[name="password"]').value= "";
                            form.querySelector('[name="email"]').value= "";
                            form.querySelector('[name="confirm_password"]').value= "";

                            const redirectUrl = form.getAttribute('data-kt-redirect-url');
                            
                            if (redirectUrl) {
                                const updatedRedirectUrl = new URL(redirectUrl);
                                updatedRedirectUrl.searchParams.set('name', response.data.name);
                                location.href = updatedRedirectUrl.toString();
                            }
                        } 
                    }).catch(function (error) {
                        const errorMessages = Object.values(error.response.data.errors).flat();
                        Swal.fire({
                            text: errorMessages.join('\n'),
                            icon: "error",
                            buttonsStyling: false,
                            confirmButtonText: "Ok, got it!",
                            customClass: {
                                confirmButton: "btn btn-primary"
                            }
                        });
                    });
                } else {
                    // Show error popup. For more info check the plugin's official documentation: https://sweetalert2.github.io/
                    Swal.fire({
                        text: "Sorry, looks like you missed out some fields, please try again.",
                        icon: "error",
                        buttonsStyling: false,
                        confirmButtonText: "Ok, got it!",
                        customClass: {
                            confirmButton: "btn btn-primary"
                        }
                    });
                }
            });
		});
    }

    // Public functions
    return {
        // Initialization
        init: function() {
            form = document.querySelector('#kt_sign_in_form');
            submitButton = document.querySelector('#kt_sign_in_submit');
            
            handleValidation();
            // handleSubmitDemo(); // used for demo purposes only, if you use the below ajax version you can uncomment this one
            handleSubmitAjax(); // use for ajax submit
        }
    };
}();

// On document ready
KTUtil.onDOMContentLoaded(function() {
    KTSigninGeneral.init();
});

// Get the current URL
const currentUrl = new URL(window.location.href);

// Get the value of the "name" query parameter
const name = currentUrl.searchParams.get('name');

if (name) {
    const userNameElement = document.getElementById('user-name');
    userNameElement.innerHTML = name;
} else {
    // console.log("No 'name' parameter found in the URL.");
}
