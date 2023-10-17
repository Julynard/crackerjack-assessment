
function clearInputFields(fields) {
    fields.forEach(field => {
        var element = $('#' + field.id);
        if (element.is('input')) {
            element.val('');
        } else if (element.is('select')) {
            element.val('').trigger('change');
        } else {
            element.val('');
        }
    });
}

function formatNumber(formattedNumber) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2
    }).format(formattedNumber);
}


function formatDate(date) {
    const monthNamesShort = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const day = date.getDate();
    const month = monthNamesShort[date.getMonth()];
    const year = date.getFullYear();
    
    return `${month} ${day}, ${year}`;
}

function showAlert(message,icon) {
    Swal.fire({
        html: message,
        icon: icon,
        buttonsStyling: false,
        confirmButtonText: "Ok, got it!",
        customClass: {
            confirmButton: "btn btn-primary"
        }
    });
}

// Start -- Expense CV/C --
    const expensePaymentDateElement = document.getElementById("exp_payment_date");
    const exp_orfno = document.getElementById("exp_orfno");
    const exp_payee = document.getElementById("exp_payee");
    const exp_payment_account = document.getElementById("exp_payment_account");
    const exp_payment_date = document.getElementById("exp_payment_date_input");
    const exp_payment_method = document.getElementById("exp_payment_method");
    const exp_request_select = document.getElementById("requestedId");
    var entries = [];

    function printVoucher(id) {
        const url = `/api/request/print/${id}`;
        
        // Make the Axios GET request to fetch the PDF data
        axios.get(url, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
            },
                responseType: 'blob', // Set the response type to 'blob'
            }).then(function (response) {
            // Create a Blob from the response data
            const blob = new Blob([response.data], { type: 'application/pdf' });

            // Create a URL for the Blob
            const blobUrl = window.URL.createObjectURL(blob);

            // Open the Blob URL in a new window or tab
            window.open(blobUrl);
            }).catch(function (error) {
                console.error('Error fetching data:', error);
        });
    }

    $(document).ready(function () {
        $("#ofs-cv-table").DataTable({
            bLengthChange: false,
            processing: true,
            serverSide: true,
            ordering: false,
            ajax: {
                url: '/api/expense-cv', // Replace with your API URL
                type: 'GET',
                data: function (data) {
                    // Add any additional parameters you need to pass to the API
                    data.search_text_cv = $('#search_text_cv').val();
                },
                headers: {
                    Authorization: `Bearer `+localStorage.getItem('auth_token')
                },
            },
            columns: [
                { 
                    data: 'checkbox', render: function (data, type, row) {
                        return `<input class="form-check-input" type="checkbox" id="check" name="id[]" value="${row.id}" data-cv-id="${row.id}">`;
                    },
                },
                { data: 'orfno'},
                { data: 'payment_date' },
                { data: 'grand_total' },
                { 
                    data: 'status',
                    render: function (data, type, row) {
                        let statusBadge;
                        if (data === 'New') {
                            statusBadge = '<div class="badge badge-primary">New</div>';
                        } else if (data === 'CV - New') {
                            statusBadge = '<div class="badge badge-light-primary">CV - New</div>';
                        } else if (data === 'CV - Approved') {
                            statusBadge = '<div class="badge badge-light-info">CV - Approved</div>';
                        } else if (data === 'CV - Released') {
                            statusBadge = '<div class="badge badge-light-warning">CV - Released</div>';
                        } else if (data === 'CV - Cleared') {
                            statusBadge = '<div class="badge badge-light-success">CV - Cleared</div>';
                        } else if (data === 'Cancelled') {
                            statusBadge = '<div class="badge badge-danger">Cancelled</div>';
                        }
                        return statusBadge;
                    }
                },
                { data: null, render: function (data, type, row) {
                    return `<span style="cursor: pointer;" onclick="printVoucher(${row.id})" target="_blank" title='Print Voucher'><i class="bi bi-printer fs-1"></i></span>`;
                } },
            ],
            columnDefs: [
                {
                    targets: 3, 
                    className: 'text-right'
                }
            ]
        });

        $('#search_text_cv').on('keyup', function (e) {
            $('#ofs-cv-table').DataTable().ajax.reload();
        });

        $("#cv_check_all").on('change', function() {
            const isChecked = $(this).prop('checked');
            $("#ofs-cv-table tbody input[type='checkbox']").prop('checked', isChecked);
        });

        $(document).on('change', '#ofs-cv-table input[type="checkbox"]', function() {
            var checkedValues = [];

            // Iterate over all checkboxes in the table
            $('#ofs-cv-table').find('input[type="checkbox"]').each(function() {
                if (this.checked) {
                    checkedValues.push(this.value);   
                }
            });

            if (checkedValues.length > 0) {
                $('#cv_apply_wrapper').removeClass('d-none');
            } else {
                $('#cv_apply_wrapper').addClass('d-none');
            }

        });

        $('#updateCVStatus').click(function (event) {
            var checkedValue = [];
            
            statusValue = $('#cv_apply_status').val();

            if (!statusValue) {
                showAlert("Please select <b>Status</b> first.",'warning');
                return;
            }

            $('#ofs-cv-table').find('input[type="checkbox"]').each(function() {
                if (this.checked) {
                    checkedValue.push(this.value);   
                }
            });

            if(checkedValue == ""){
                showAlert("Please select <b>No Data</b> first.",'warning');
                return;
            }

            var data = {
                statusValue: statusValue,
                checkedValue: checkedValue
            };

            var receiptHeaders = {
                'Authorization': `Bearer `+localStorage.getItem('auth_token')
            };

            axios.post('/api/expenses/cv-update', data, { headers: receiptHeaders })
            .then(response => {
                const responseData = response.data;
                showAlert("Voucher/s status updated successfully!",'success')

                $('#ofs-cv-table').DataTable().ajax.reload();
                document.getElementById("cv_check_all").checked = false;
                $('#cv_apply_wrapper').addClass('d-none');
                
                return responseData;
            }).catch(error => {
                showAlert("An error occurred while updating accounts!",'error')
                console.error(error);
            });

        });

        if (expensePaymentDateElement !== null) {
            // The element exists, so initialize the TempusDominus date picker
            new tempusDominus.TempusDominus(expensePaymentDateElement, {
                display: {
                    viewMode: "calendar",
                    components: {
                        decades: true,
                        year: true,
                        month: true,
                        date: true,
                        hours: false,
                        minutes: false,
                        seconds: false
                    }
                }
            });
        }
        
        if(exp_orfno !== null){
            
            axios.get('/api/expense-orfno', {
                headers: {
                    Authorization: `Bearer `+localStorage.getItem('auth_token'),
                },
            }).then(function (response) {
                // Check if the response has the 'select' key
                if (response.data && response.data.select_orfno) {
                    const responseOptions = response.data.select_orfno;
                    const expRequestValue = exp_request_select.value;

                    if (expRequestValue) {
                        // Set the innerHTML of exp_orfno directly
                        exp_orfno.innerHTML = responseOptions;
        
                        // Loop through the options and set the 'selected' attribute if the value matches
                        const options = exp_orfno.querySelectorAll("option");
                        options.forEach((option) => {
                            const optionValue = option.getAttribute("value");
                            if (optionValue === expRequestValue) {
                                option.setAttribute("selected", "selected");
                            } else {
                                option.removeAttribute("selected");
                            }
                        });
        
                        $('#exp_orfno').trigger('change');
                    } else {
                        exp_orfno.innerHTML = responseOptions;
                    }
                } else {
                    console.error('API response does not contain the expected data.');
                }
            })
            .catch(function (error) {
                console.error('Error fetching data:', error);
            });

            // axios.get('/api/expense-partner', {
            //     headers: {
            //         Authorization: `Bearer `+localStorage.getItem('auth_token'),
            //     },
            // }).then(function (response) {
            //     // Check if the response has the 'select' key
            //     if (response.data.select_partner) {
            //         const responseOptions = response.data.select_partner;
            //         exp_payee.innerHTML = responseOptions;
                    
            //     } else {
            //         console.error('API response does not contain the expected data.');
            //     }
            // })
            // .catch(function (error) {
            //     console.error('Error fetching data:', error);
            // });

            // Function to populate the select element
            function populateSelect(data) {
                const receipt_payee = document.getElementById('exp_payee');
                receipt_payee.innerHTML = ''; // Clear existing options

                // Add an empty option as a placeholder
                receipt_payee.appendChild(new Option('', ''));
                
                // Loop through the data and add options to the select element
                data.forEach(partner => {
                    receipt_payee.appendChild(new Option(partner.partner_name, partner.id));
                });
            }
            
            // Fetch data from the API endpoint using Axios
            axios.get('/api/expense-partner', {
                headers: {
                    Authorization: `Bearer `+localStorage.getItem('auth_token'),
                },
            }).then(response => {
                const partners = response.data.partners;
                populateSelect(partners);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
            
            axios.get('/api/expense-assets', {
                headers: {
                    Authorization: `Bearer `+localStorage.getItem('auth_token'),
                },
            }).then(function (response) {
                // Check if the response has the 'select' key
                if (response.data.select_assets) {
                    const responseOptions = response.data.select_assets;
                    exp_payment_account.innerHTML = responseOptions;
                    
                } else {
                    console.error('API response does not contain the expected data.');
                }
            })
            .catch(function (error) {
                console.error('Error fetching data:', error);
            });
        }

        $("#exp_orfno").on('change', function() {
            entries = [];
            $('#addRequestCVBtn').show();
            const request_id = this.value;
            const expenseTable = $('#ofs-expenses-table tbody');
            $('#exp_check_all').prop('checked', false);
            $('#exp_apply_wrapper').addClass('d-none');
        
            if(request_id){

                $('#exp_payment_method').prop('disabled', true);
                $('#exp_payee').prop('disabled', true);
                $('#exp_orfno').prop('disabled', true);

                axios.get('/api/expense/'+request_id+'/orfno', {
                    headers: {
                        Authorization: `Bearer `+localStorage.getItem('auth_token'),
                    },
                }).then(function (response) {
                    $('#exp_grand_total').text('₱ '+formatNumber(response.data.grand_total));
                    if (response.data.payment_method === "Cash") {
                        $('#exp_payment_method').val(response.data.payment_method).trigger('change');
                        // $('#exp_payee_wrapper').show();
                        // $('#exp_payee_input_wrapper').hide();
                    } else {
                        $('#exp_payment_method').val("Check").trigger('change');
                        $('#exp_payee').val(response.data.payment_method).trigger('change');;
                        // $('#exp_payee_wrapper').hide();
                        // $('#exp_payee_input_wrapper').show();
                    }
                    
                    expenseTable.empty();
                    var groupedAccounts = {};

                    response.data.accounts.forEach(function (account) {
                        var type = account.type || ''; // Use an empty string for accounts without a type.
                        if (!groupedAccounts[type]) {
                            groupedAccounts[type] = [];
                        }
                        groupedAccounts[type].push(account);
                    });

                    for (var type in groupedAccounts) {
                        if (groupedAccounts.hasOwnProperty(type)) {
                            var optgroup = $('<optgroup>').attr('label', type);
                            $('#exp_apply_account').append(optgroup);
                            groupedAccounts[type].forEach(function (account) {
                                $('#exp_apply_account').append($('<option>').val(account.value).text(account.text));
                            });
                        }
                    }

                    $('#exp_apply_account').select2();

                    response.data.request_details.forEach(function (detail, index) {
                        var row = $('<tr>'); 
                        row.append($('<td style="vertical-align: middle;">').text(index + 1)); 

                        var checkboxCell = $('<td style="vertical-align: middle;">');
                        var checkbox = $('<input>')
                            .addClass('form-check-input')
                            .attr('type', 'checkbox')
                            .attr('value', index)
                            .attr('name', 'exp_checkbox_'+index);

                        checkboxCell.append(checkbox);
                        row.append(checkboxCell);

                        var dropdownCell = $('<td style="vertical-align: middle;">');
            
                        var select = $('<select>')
                            .addClass('form-select')
                            .attr('name', 'exp_account_'+ index);
                            select.attr('id', 'exp_account_'+ index); 
                            select.attr('data-control', 'select2'); 
                            select.attr('data-placeholder', 'Select an option');    
                        
                        for (var type in groupedAccounts) {
                            if (groupedAccounts.hasOwnProperty(type)) {
                                var optgroup = $('<optgroup>').attr('label', type);
                                groupedAccounts[type].forEach(function (account) {
                                    optgroup.append($('<option>').val(account.value).text(account.text));
                                });
                                select.append(optgroup);
                            }
                        }
            
                        dropdownCell.append(select); 
                        row.append(dropdownCell);
                        
                        row.append($('<td style="vertical-align: middle;">').text(detail.particular));
                        row.append($('<td style="vertical-align: middle;" class="text-right">').text(formatNumber(detail.subtotal)));
            
                        expenseTable.append(row);

                        select.select2();

                        entries[index] = {
                            account_id: '',
                            particular: '',
                            subtotal: ''
                        };
                        
                        select.on('change', function() {
                            // Get the selected option's account_id
                            var selectedAccountId = $(this).val();

                            entries[index] = {
                                account_id: selectedAccountId,
                                particular: detail.particular,
                                subtotal: detail.subtotal
                            };
                        });
                        
                    });

                })
                .catch(function (error) {
                    console.error('Error fetching data:', error);
                });
            }
        }); 
        
        $('#addRequestCVBtn').click(function (event) {
            event.preventDefault(); 
            var emptyFields = [];

            // Define an array of field names for displaying in the alert
            var fieldNames = ['ORF No', 'Payee', 'Payment Account', 'Payment Date', 'Payment Method'];
            const payee_input = $('#exp_payee_input').val();
            
            // Define an array of field values
            var fieldValues = [
                exp_orfno.value.trim(),
                (payee_input ? payee_input : exp_payee.value.trim()),
                exp_payment_account.value.trim(),
                exp_payment_date.value,
                exp_payment_method.value.trim(),
            ];

            // Iterate through the fields to check if they are empty
            for (var i = 0; i < fieldValues.length; i++) {
                if (fieldValues[i] === '') {
                    emptyFields.push(fieldNames[i]);
                }
            }

            if (emptyFields.length > 0) {
                showAlert("Please fill out the following fields: <b>" + emptyFields.join(', ') + "</b>", 'warning');
                return;
            }

            var entriesMissingAccountID = [];

            for (var i = 0; i < entries.length; i++) {
                if (!entries[i].hasOwnProperty('account_id') || entries[i]['account_id'].trim() === '') {
                    entriesMissingAccountID.push(i + 1); // Store the ID of entries missing account_id
                }
            }

            if (entriesMissingAccountID.length > 0) {
                showAlert("The following entries are missing an account ID: " + entriesMissingAccountID.join(', '), 'warning');
                
                // Set text color to red for entries missing account_id
                $('#ofs-expenses-table tbody tr').each(function(index) {
                    if (entriesMissingAccountID.includes(index + 1)) {
                        $(this).css('color', 'red');
                    }else{
                        $(this).css('color', '');
                    }
                });

                return;
            }else{
                $('#ofs-expenses-table tbody tr').css('color', '');
            }

            
            var data = {
                request_id: fieldValues[0],
                partner_id: (payee_input ? payee_input : parseInt(fieldValues[1])), 
                cash_id: fieldValues[2],
                payment_date: fieldValues[3],
                entries: entries
            };

            var receiptHeaders = {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            };

            axios.post('/api/expense/create', data, { headers: receiptHeaders })
            .then(response => {
                // console.log(response.data.message);
                showAlert("Check Voucher successfully created!",'success')
                setTimeout(function() {
                    document.getElementById('budgetRequestLink').click();
                }, 2000);
            }).catch(error => {
                showAlert("An error occurred while updating accounts!",'error')
                console.error(error);
            });
        });

        $("#exp_check_all").on('change', function() {
            const isChecked = $(this).prop('checked');
            // Select or deselect all checkboxes in the table
            $("#ofs-expenses-table tbody input[type='checkbox']").prop('checked', isChecked);
        });
        
        $(document).on('change', '#ofs-expenses-table input[type="checkbox"]', function() {
            var checkedValues = [];

            // Iterate over all checkboxes in the table
            $('#ofs-expenses-table').find('input[type="checkbox"]').each(function() {
                if (this.checked) {
                    checkedValues.push(this.value);   
                }
            });

            if (checkedValues.length > 0) {
                $('#exp_apply_wrapper').removeClass('d-none');
            } else {
                $('#exp_apply_wrapper').addClass('d-none');
            }

        });

        $('#applyToAllAccounts').click(function (event) {
            var checkedValue = [];
            accountValue = $('#exp_apply_account').val();

            if (!accountValue) {
                showAlert("Please select <b>Account</b> first.",'warning');
                return;
            }

            $('#ofs-expenses-table').find('input[type="checkbox"]').each(function() {
                if (this.checked) {
                    checkedValue.push(this.value);   
                }
            });

            checkedValue.forEach(function (index) {
                $('#exp_account_' + index).val(accountValue).trigger('change');
            });

            $('#ofs-expenses-table').find('input[type="checkbox"]').prop('checked', false);
            $('#exp_apply_wrapper').addClass('d-none');
        });
    });

// End -- Expense CV/C--

// Start users
    $(document).ready(function () {

        $("#tblUsers").DataTable({
            bLengthChange: false,
            processing: true,
            serverSide: true,
            ajax: {
                url: '/api/users', // Replace with your API URL
                type: 'GET',
                data: function (data) {
                    // Add any additional parameters you need to pass to the API
                    data.txtSearchUser = $('#txtSearchUser').val();
                },
                headers: {
                    Authorization: `Bearer `+localStorage.getItem('auth_token'),
                },
            },
            columns: [
                { data: 'id', className: "text-center" },
                { data: 'role', className: "text-center" },
                { data: 'user_name', className: "text-center" },
                { data: 'first_name', className: "text-center" },
                { data: 'middle_name', className: "text-center" },
                { data: 'last_name', className: "text-center" },
                { data: 'email', className: "text-center" },
                
                { data: null, render: function (data, type, row) {
                    return `<a href='#' class="btn btn-warning btn-sm" onclick="openUserModal('update', '${data.id}')">EDIT</a>`;
                } },
            ],
        });
        $('#txtSearchUser').on('keyup', function (e) {
            // Trigger an Ajax request to update the DataTable
            $('#tblUsers').DataTable().ajax.reload();
        });
    });

    function openUserModal(action, userId) {
        const modal = new bootstrap.Modal(document.getElementById('userModal'), {
            backdrop: 'static',
            keyboard: false
        });

        const modalContent = document.getElementById('modalContent');
        const modalActionBtn = document.getElementById('modalActionBtn');
        const modalTitle = document.getElementById('userModalLabel');

        // Clear previous content
        modalContent.innerHTML = '';

        if (action === 'register') {
            modalTitle.textContent = 'User Registration';
            // Customize content for registration (e.g., registration form)
            modalContent.innerHTML = `
                <div class="text-center">
                <label class="mb-2"><b>NOTE: All fields with <label class="text-danger">*</label> is required.</b></label>
                </div>
                <hr>
                <form id="registration-form">
                    <div class="form-group">
                        <label for="txtRole">Role:</label><label class="text-danger">*</label>
                        <select class="form-control text-center" id="txtRole" required>
                            <option value="" selected>***Select Role***</option>
                            <option value="Guest">Guest</option>
                            <option value="Admin">Admin</option>
                            <option value="Requestor">Requestor</option>
                            <option value="Finance">Finance</option>
                            <option value="Accounting">Accounting</option>
                            <option value="Treasury">Treasury</option>
                        </select>
                    </div>
                    <div class="row">
                        <div class="col-sm-6">
                            <div class="form-group">
                                <label for="txtEmail">Email:</label><label class="text-danger">*</label>
                                <input type="email" class="form-control" placeholder="Email" id="txtEmail" name="txtEmail" required>
                            </div>
                        </div>
                        <div class="col-sm-6">
                            <div class="form-group">
                                <label for="txtUserName">User Name:</label><label class="text-danger">*</label>
                                <input type="text" class="form-control" placeholder="User Name" id="txtUserName" name="txtUserName" required>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-sm-4">
                            <div class="form-group">
                                <label for="txtFname">First Name:</label><label class="text-danger">*</label>
                                <input type="text" class="form-control" placeholder="First Name" id="txtFname" name="txtFname" required>
                            </div>
                        </div>
                        <div class="col-sm-4">
                            <div class="form-group">
                                <label for="txtMname">Middle Name:</label>
                                <input type="text" class="form-control" placeholder="First Name" id="txtMname" name="txtMname">
                            </div>
                        </div>
                        <div class="col-sm-4">
                            <div class="form-group">
                                <label for="txtLname">Last Name:</label><label class="text-danger">*</label>
                                <input type="text" class="form-control" placeholder="First Name" id="txtLname" name="txtLname" required>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-sm-6">
                            <div class="form-group">
                                <label for="txtPass">Password:</label><label class="text-danger">*</label>
                                <input type="password" class="form-control" placeholder="Password" id="txtPass" name="txtPass" required>
                            </div>
                        </div>
                        <div class="col-sm-6">
                            <div class="form-group">
                                <label for="txtConfirmPass">Confirm Password:</label><label class="text-danger">*</label>
                                <input type="password" class="form-control" placeholder="Confirm Password" id="txtConfirmPass" name="password_confirmation" required>
                            </div>
                        </div>
                    </div>
                </form>
            `;
            modalActionBtn.textContent = 'Register';
        } else if (action === 'update' && userId) {
            modalTitle.textContent = 'User Update';
            $.ajax({
                url: '/api/users/' + userId, // Replace with your API URL for fetching user details
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
                },
                success: function (userData) {
                    // Populate the edit form fields with the retrieved data
                    $('#txtRole').val(userData.role);
                    $('#txtUserName').val(userData.user_name);
                    $('#txtFname').val(userData.first_name);
                    $('#txtMname').val(userData.middle_name);
                    $('#txtLname').val(userData.last_name);
                    $('#txtEmail').val(userData.email);
                    $('#txtPass').val(userData.password);
                    $('#txtConfirmPass').val(userData.password);
                    // Show the modal with populated data
                    modal.show();
                },
                error: function () {
                    // Handle error if user data cannot be fetched
                    console.error('Error fetching user data');
                }
            });

            modalActionBtn.textContent = 'Update';

            // Customize content for update (e.g., update form)
            modalContent.innerHTML = `
                <div class="text-center">
                <label class="mb-2"><b>NOTE: All fields with <label class="text-danger">*</label> is required.</b></label>
                </div>
                <hr>
                <form id="registration-form">
                    <div class="form-group">
                        <label for="txtRole">Role:</label><label class="text-danger">*</label>
                        <select class="form-control text-center" id="txtRole" required>
                            <option value="" selected>***Select Role***</option>
                            <option value="Guest">Guest</option>
                            <option value="Admin">Admin</option>
                            <option value="Requestor">Requestor</option>
                            <option value="Finance">Finance</option>
                            <option value="Accounting">Accounting</option>
                            <option value="Treasury">Treasury</option>
                        </select>
                    </div>
                    <div class="row">
                        <div class="col-sm-6">
                            <div class="form-group">
                                <label for="txtEmail">Email:</label><label class="text-danger">*</label>
                                <input type="email" class="form-control" placeholder="Email" id="txtEmail" name="txtEmail" required>
                            </div>
                        </div>
                        <div class="col-sm-6">
                            <div class="form-group">
                                <label for="txtUserName">User Name:</label><label class="text-danger">*</label>
                                <input type="text" class="form-control" placeholder="User Name" id="txtUserName" name="txtUserName" required>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-sm-4">
                            <div class="form-group">
                                <label for="txtFname">First Name:</label><label class="text-danger">*</label>
                                <input type="text" class="form-control" placeholder="First Name" id="txtFname" name="txtFname" required>
                            </div>
                        </div>
                        <div class="col-sm-4">
                            <div class="form-group">
                                <label for="txtMname">Middle Name:</label>
                                <input type="text" class="form-control" placeholder="First Name" id="txtMname" name="txtMname">
                            </div>
                        </div>
                        <div class="col-sm-4">
                            <div class="form-group">
                                <label for="txtLname">Last Name:</label><label class="text-danger">*</label>
                                <input type="text" class="form-control" placeholder="First Name" id="txtLname" name="txtLname" required>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-sm-6">
                            <div class="form-group">
                                <label for="txtPass">Password:</label><label class="text-danger">*</label>
                                <input type="password" class="form-control" placeholder="Password" id="txtPass" name="txtPass" required>
                            </div>
                        </div>
                        <div class="col-sm-6">
                            <div class="form-group">
                                <label for="txtConfirmPass">Confirm Password:</label><label class="text-danger">*</label>
                                <input type="password" class="form-control" placeholder="Confirm Password" id="txtConfirmPass" name="password_confirmation" required>
                            </div>
                        </div>
                    </div>
                </form>
            `;
            modalActionBtn.textContent = 'Update';
            // Skip email validation
            document.getElementById('txtEmail').removeAttribute('required');
        }

        modal.show();
    }

    function registerUser() {
        
        const role = document.getElementById('txtRole').value;
        const user_name = document.getElementById('txtUserName').value;
        const first_name = document.getElementById('txtFname').value;
        const middle_name = document.getElementById('txtMname').value;
        const last_name = document.getElementById('txtLname').value;
        const email = document.getElementById('txtEmail').value;
        const password = document.getElementById('txtPass').value;
        const password_confirmation = document.getElementById('txtConfirmPass').value;

        // Create a user data object
        const userData = {
            role,
            user_name,
            first_name,
            middle_name,
            last_name,
            email,
            password,
            password_confirmation
        };

        function clearRegisterForm() {
            // Get a reference to the form element
            const form = document.getElementById('registration-form');

            // Loop through all form elements and reset their values
            for (let i = 0; i < form.elements.length; i++) {
                const element = form.elements[i];

                // Check if the element is an input, textarea, or select
                if (['input', 'textarea', 'select'].includes(element.tagName.toLowerCase())) {
                    // Reset the value of the element
                    element.value = '';
                }
            }
        }

        // Send the registration request to your Laravel API
        axios.post('http://localhost:8000/api/registerUser', userData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
            }
        }).then((response) => {
                console.log('User registered successfully:', response.data);

                // Determine the action based on the response message
                const isRegistration = response.data.message.includes('registered');
                const isUpdate = response.data.message.includes('updated');

                // Handle success based on the action
                if (isRegistration || isUpdate) {
                    Swal.fire({
                        html: response.data.message,
                        icon: "success",
                        buttonsStyling: false,
                        confirmButtonText: "Ok, got it!",
                        customClass: {
                            confirmButton: "btn btn-primary"
                        }
                    });

                    // Add a timeout to close the Swal modal after 3 seconds
                    setTimeout(() => {
                        Swal.close();
                    }, 3000); // 3000 milliseconds (3 seconds)

                    clearRegisterForm();
                    $('#userModal').modal('hide');
                    $('#tblUsers').DataTable().ajax.reload();
                } else {
                    // Handle unexpected response here, possibly an error
                    console.error('Unexpected response:', response.data);
                }
            })
            .catch((error) => {
                console.error('Error registering user:', error.response.data);
                // Handle error (e.g., display validation errors to the user)

                // Initialize an empty string to hold the error messages
                let errorMessage = '';

                // Loop through the error object and concatenate error messages
                for (const key in error.response.data.errors) {
                    errorMessage += `${error.response.data.errors[key][0]}<br>`;
                }

                Swal.fire({
                    html: errorMessage,
                    icon: "error",
                    buttonsStyling: false,
                    confirmButtonText: "Ok, got it!",
                    customClass: {
                        confirmButton: "btn btn-primary"
                    }
                });

                // Add a timeout to close the Swal modal after 3 seconds
                setTimeout(() => {
                    Swal.close();
                }, 3000); // 3000 milliseconds (3 seconds)
            });
    }
// End users

// Start -- Chart Of Accounts --
    $(document).ready(function () {
        const accountsTable = $("#ofs-coa-table").DataTable({
            bLengthChange: false,
            processing: true,
            serverSide: true,
            ordering: false,
            ajax: {
                url: '/api/account', // Replace with your API URL
                type: 'GET',
                data: function (data) {
                    // Add any additional parameters you need to pass to the API
                    data.search_text_coa = $('#search_text_coa').val();
                },
                headers: {
                    Authorization: `Bearer `+localStorage.getItem('auth_token'),
                }
            },
            columns: [
                { data: 'type' },
                { data: 'name', render: function (data, type, row) {
                    return `<a href='#' title='View Account'>${data}</a>`;
                } },
                { data: 'beginning_balance' },
                { data: 'currency' },
                { data: 'status' },
                { data: null, render: function (data, type, row) {
                    return `<a href='/api/account/edit/${row.id}' target="_blank" title='Edit Account'><i class='bi bi-pencil-square'></i></a>`;
                } },
            ],
            columnDefs: [
                {
                    targets: 2, // Index of the grand_total column (0-based)
                    className: 'text-right' // Apply the 'text-right' class for right alignment
                }
            ]
        });

        $('#search_text_coa').on('keyup', function (e) {
            // Trigger an Ajax request to update the DataTable
            $('#ofs-coa-table').DataTable().ajax.reload();
        });
        
        var fields = [];
        $('#addCoaBtn').click(function (event) {
            event.preventDefault();
            
            // Define field data and labels
            var checkbox = document.getElementById("is_sub_action");

            fields = [
                { id: 'coa_name', label: 'COA Name' },
                { id: 'coa_types', label: 'COA Types' },
                { id: 'currency', label: 'Currency' },
            ];

            if (checkbox.checked) {
                fields = [
                    { id: 'coa_name', label: 'COA Name' },
                    { id: 'coa_types', label: 'COA Types' },
                    { id: 'currency', label: 'Currency' },
                    { id: 'parent_acc', label: 'Parent Account' }
                ];
            }
        
            // Check for empty fields
            var emptyFields = fields.filter(field => !$('#' + field.id).val());

            if (emptyFields.length > 0) {
                var emptyFieldLabels = emptyFields.map(field => field.label).join(', ');
                Swal.fire({
                    html: "Please fill in the following required fields: <strong>" + emptyFieldLabels + "</strong>" ,
                    icon: "warning",
                    buttonsStyling: false,
                    confirmButtonText: "Ok, got it!",
                    customClass: {
                        confirmButton: "btn btn-primary"
                    }
                });
                return;
            }

            // Create the data object to send
            var data = {};
            fields.forEach(field => {
                data[field.id] = $('#' + field.id).val();
            });
            var csrfToken = $('input[name="_token"]').val();

            // Set up the headers
            var headers = {
                'X-CSRF-TOKEN': csrfToken,
                'Content-Type': 'application/json', // Adjust the content type if needed
                'Authorization': `Bearer `+localStorage.getItem('auth_token')
            };

            axios.post('/api/account/add', data, { headers: headers })
                .then(response => {
                    Swal.fire({
                        text: "Account saved successfully!",
                        icon: "success",
                        buttonsStyling: false,
                        confirmButtonText: "Ok, got it!",
                        customClass: {
                            confirmButton: "btn btn-primary"
                        }
                    });

                    clearInputFields(fields);
                    $('#addCoaModal').modal('hide');
                    $('#ofs-coa-table').DataTable().ajax.reload();
                })
                .catch(error => {
                    Swal.fire({
                        text: "An error occurred while saving data!",
                        icon: "error",
                        buttonsStyling: false,
                        confirmButtonText: "Ok, got it!",
                        customClass: {
                            confirmButton: "btn btn-primary"
                        }
                    });
                    console.error(error);
                });
        });

        $(document).on('change', '#coa_types', function () {
            const selectedTypeId = $(this).val();
            const parentAccSelect = document.getElementById('parent_acc');
            if (selectedTypeId) {
                axios.get(`/api/account/coa/getparentcoa?coa_type_id=${selectedTypeId}`, {
                    headers: {
                        Authorization: `Bearer `+localStorage.getItem('auth_token'),
                    }
                })
                .then(response => {
                    const data = response.data;
                    parentAccSelect.innerHTML = '';

                    data.forEach(parentAcc => {
                        const option = document.createElement('option');
                        option.value = parentAcc.id; // Change to the appropriate value for parent_acc
                        option.textContent = parentAcc.name; // Change to the appropriate field for parent_acc
                        parentAccSelect.appendChild(option);
                    });
                })
                .catch(error => {
                    console.error('Error fetching parent COA:', error);
                });
            }
        });
    });     
// End -- Chart Of Accounts --

// Start -- Receipts --
    function generateReceiptPDF(receiptId) {
        const url = `/api/receipt/print/${receiptId}`; // Update the URL as needed

        // Make the Axios GET request to fetch the PDF data
        axios.get(url, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
            },
                responseType: 'blob', // Set the response type to 'blob'
            }).then(function (response) {
            // Create a Blob from the response data
            const blob = new Blob([response.data], { type: 'application/pdf' });

            // Create a URL for the Blob
            const blobUrl = window.URL.createObjectURL(blob);

            // Open the Blob URL in a new window or tab
            window.open(blobUrl);
            }).catch(function (error) {
                console.error('Error fetching data:', error);
        });
    
        // Open the PDF in a new window/tab using the GET method
        // window.open(url, '_blank');
    }

    function printReceipt(id) {
            const url = `/api/receipt/print/${id}`;
            
            // Make the Axios GET request to fetch the PDF data
            axios.get(url, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
                },
                    responseType: 'blob', // Set the response type to 'blob'
                }).then(function (response) {
                // Create a Blob from the response data
                const blob = new Blob([response.data], { type: 'application/pdf' });

                // Create a URL for the Blob
                const blobUrl = window.URL.createObjectURL(blob);

                // Open the Blob URL in a new window or tab
                window.open(blobUrl);
                }).catch(function (error) {
                    console.error('Error fetching data:', error);
            });
    }

    $(document).ready(function () {
        const receiptsTable = $("#ofs-receipt-table").DataTable({
            bLengthChange: false,
            processing: true,
            serverSide: true,
            ordering: false,
            ajax: {
                url: '/api/receipt', // Replace with your API URL
                type: 'GET',
                data: function (data) {
                    // Add any additional parameters you need to pass to the API
                    data.search_text_receipt = $('#search_text_receipt').val();
                },
                headers: {
                    Authorization: `Bearer `+localStorage.getItem('auth_token'),
                }
            },
            columns: [
                { 
                    data: 'checkbox', render: function (data, type, row) {
                        return `<input class="form-check-input" type="checkbox" id="check" name="id[]" value="${row.id}" data-receipt-id="${row.id}">`;
                    },
                },
                { data: 'date_issued' },
                { data: 'account_id' },
                { data: 'arno', render: function (data, type, row) {
                    return `<a href='#' data-bs-toggle="modal" data-bs-target="#receiptModal" data-receipt-id="${row.id}" title='View Receipt'>${data}</a>`;
                } },
                { data: 'partner_name' },
                { data: 'received_by' },
                { data: 'description' },
                { data: 'grand_total' },
                { data: 'payment_method' },
                { 
                    data: 'status',
                    render: function (data, type, row) {
                        let statusBadge;
                        if (data === 'New') {
                            statusBadge = '<div class="badge badge-primary">New</div>';
                        } else if (data === 'CV - New') {
                            statusBadge = '<div class="badge badge-light-primary">CV - New</div>';
                        } else if (data === 'CV - Approved') {
                            statusBadge = '<div class="badge badge-light-info">CV - Approved</div>';
                        } else if (data === 'CV - Released') {
                            statusBadge = '<div class="badge badge-light-warning">CV - Released</div>';
                        } else if (data === 'CV - Cleared') {
                            statusBadge = '<div class="badge badge-light-success">CV - Cleared</div>';
                        } else if (data === 'Cancelled') {
                            statusBadge = '<div class="badge badge-danger">Cancelled</div>';
                        }
                        return statusBadge;
                    }
                },
                { data: null, render: function (data, type, row) {
                    return `<span style="cursor: pointer;" onclick="printReceipt(${row.id})" target="_blank" title='Print Receipt'><i class="bi bi-printer fs-1"></i></span>`;
                } },
            ],
            columnDefs: [
                {
                    targets: 7, // Index of the grand_total column (0-based)
                    className: 'text-right' // Apply the 'text-right' class for right alignment
                }
            ]
        });

        $('#search_text_receipt').on('keyup', function (e) {
            $('#ofs-receipt-table').DataTable().ajax.reload();
        });
        
        const accountElement = document.getElementById("account");
        const depositElement = document.getElementById("deposit");

        if (accountElement !== null) {
            // The element exists, so make the Axios request
            axios.get('/api/receipt/accounts', {
                headers: {
                    Authorization: `Bearer `+localStorage.getItem('auth_token'),
                },
            }).then(function (response) {
                    // Check if the response has the 'select' key
                    if (response.data && response.data.select) {
                        accountElement.innerHTML = response.data.select;
                    } else {
                        console.error('API response does not contain the expected data.');
                    }
                })
                .catch(function (error) {
                    console.error('Error fetching data:', error);
                });
            axios.get('/api/receipt/banks', {
                headers: {
                    Authorization: `Bearer `+localStorage.getItem('auth_token'),
                },
            }).then(function (response) {
                    if (response.data && response.data.select_bank) {
                        depositElement.innerHTML = response.data.select_bank;
                    } else {
                        console.error('API response does not contain the expected data.');
                    }
                })
                .catch(function (error) {
                    console.error('Error fetching data:', error);
                });
        }
        
        $('#addReceiptBtn').click(function (event) {
            event.preventDefault(); 

            const selected = $('#receipt_payment_method').val();
            if(selected === "Cash"){
                fields = [
                    { id: 'receipt_payee', label: 'Payee' },
                    { id: 'receipt_payment_method', label: 'Payment Method' },
                    { id: 'receipt_desc', label: 'Description' },
                    { id: 'receipt_cash_amount', label: 'Cash Amount' },
                ];
            } else if (selected === "Check"){
                fields = [
                    { id: 'receipt_payee', label: 'Payee' },
                    { id: 'receipt_payment_method', label: 'Payment Method' },
                    { id: 'receipt_desc', label: 'Description' },
                    { id: 'receipt_check_amount', label: 'Check Amount' }
                ];
            } else if (selected === "Check and Cash"){
                fields = [
                    { id: 'receipt_payee', label: 'Payee' },
                    { id: 'receipt_payment_method', label: 'Payment Method' },
                    { id: 'receipt_desc', label: 'Description' },
                    { id: 'receipt_cash_amount', label: 'Cash Amount' },
                    { id: 'receipt_check_amount', label: 'Check Amount' }
                ];
            } else {
                fields = [
                    { id: 'receipt_payee', label: 'Payee' },
                    { id: 'receipt_payment_method', label: 'Payment Method' },
                    { id: 'receipt_desc', label: 'Description' },
                ];
            }
    
            // Check for empty fields
            var emptyFields = fields.filter(field => !$('#' + field.id).val());

            if (emptyFields.length > 0) {
                var emptyFieldLabels = emptyFields.map(field => field.label).join(', ');
                Swal.fire({
                    html: "Please fill in the following required fields: <strong>" + emptyFieldLabels + "</strong>" ,
                    icon: "warning",
                    buttonsStyling: false,
                    confirmButtonText: "Ok, got it!",
                    customClass: {
                        confirmButton: "btn btn-primary"
                    }
                });
                return;
            }

            // Create the data object to send
            var data = {};
            fields.forEach(field => {
                data[field.id] = $('#' + field.id).val();
            });

            var receiptHeaders = {
                'Authorization': `Bearer `+localStorage.getItem('auth_token'),
            };
    
            axios.post('/api/receipt/add', data, { headers: receiptHeaders })
            .then(response => {
                const responseData = response.data;
                showAlert("Receipt saved successfully!",'success')

                clearInputFields(fields);
                $('#addReceiptModal').modal('hide');
                $('#ofs-receipt-table').DataTable().ajax.reload();
                return responseData;
            })
            .then(data => {
                generateReceiptPDF(data.receipt_id)
            })
            .catch(error => {
                Swal.fire({
                    text: "An error occurred while saving data!",
                    icon: "error",
                    buttonsStyling: false,
                    confirmButtonText: "Ok, got it!",
                    customClass: {
                        confirmButton: "btn btn-primary"
                    }
                });
                console.error(error);
            });
        });

        $('#receiptModal').on('show.bs.modal', function (event) {
            const button = $(event.relatedTarget);
            const receiptId = button.data('receipt-id');

            // Disable all input fields
            $('#v_receipt_payee').prop('disabled', true);
            $('#v_receipt_payment_method').prop('disabled', true);
            $('#v_receipt_desc').prop('disabled', true);
            $('#v_receipt_cash_amount').prop('disabled', true);
            $('#v_receipt_check_amount').prop('disabled', true);

            // Clear all input fields
            $('#v_receipt_cash_amount').val('');
            $('#v_receipt_check_amount').val('');
            $('#v_receipt_payee').val('');
            $('#v_receipt_desc').val('');
            $('#v_receipt_payment_method').val('');
            $('#v_receipt_payment_method').trigger('change.select2');

            // Change the type of input fields to text
            $('#v_receipt_cash_amount').prop('type', 'text');
            $('#v_receipt_check_amount').prop('type', 'text');

            // Hide the copy button and show the edit and cancel buttons
            $('#copyReceiptBtn').hide();
            $('#receiptCopy').show();
            $('#receiptCancel').show();

            //Change the title
            $('#title_receipt').text('View Receipt');

            // Use Axios to fetch data
            axios.get(`/api/receipt/${receiptId}`, {
                headers: {
                    Authorization: `Bearer `+localStorage.getItem('auth_token'),
                }
            }).then(response => {
                const receiptData = response.data;
                // Populate the HTML elements with the fetched data
                $('#v_receipt_id').val(receiptData.id);
                $('#v_date_issued').text(receiptData.date_issued); 
                $('#v_receipt_desc').val(receiptData.description);
                $('#v_receipt_payment_method').val(receiptData.payment_method).trigger('change.select2');
                $('#v_receipt_payee').val(receiptData.payee_id).trigger('change.select2');

                console.log('data', receiptData.payee_id)

                if (receiptData.cash_total) {
                    // Show the div with class 'v_cash'
                    $('.v_cash').removeClass('d-none');
        
                    // Populate the input field with cash_total value
                    $('#v_receipt_cash_amount').val(formatNumber(receiptData.cash_total));
                }else{
                    $('.v_cash').addClass('d-none');
                }
                if (receiptData.check_total) {
                    // Show the div with class 'v_cash'
                    $('.v_check').removeClass('d-none');
        
                    // Populate the input field with check_total value
                    $('#v_receipt_check_amount').val(formatNumber(receiptData.check_total));
                }else{
                    $('.v_check').addClass('d-none');
                }
            })
            .catch(error => {
                console.error('Error fetching receipt data:', error);
            });
        });

        $('#receiptCopy').click(function() {
            const currentDate = new Date();
            const cashAmountValue = $('#v_receipt_cash_amount').val().replace(/,/g, '');
            const checkAmountValue = $('#v_receipt_check_amount').val().replace(/,/g, '');
        
            $('#title_receipt').text('New Receipt');
            $('#v_date_issued').text(formatDate(currentDate));
        
            $(':disabled').removeAttr('disabled');
            $('#v_receipt_cash_amount').val(cashAmountValue).prop('type', 'number');
            $('#v_receipt_check_amount').val(checkAmountValue).prop('type', 'number');
        
            $('#copyReceiptBtn').show();
            $('#receiptCopy').hide();
            $('#receiptCancel').hide();
        });

        $('#copyReceiptBtn').click(function (event) {
            event.preventDefault(); 
            const v_selected = $('#v_receipt_payment_method').val();
            if(v_selected === "Cash"){
                fields = [
                    { id: 'v_receipt_payee', label: 'Payee' },
                    { id: 'v_receipt_payment_method', label: 'Payment Method' },
                    { id: 'v_receipt_desc', label: 'Description' },
                    { id: 'v_receipt_cash_amount', label: 'Cash Amount' },
                ];
            } else if (v_selected === "Check"){
                fields = [
                    { id: 'v_receipt_payee', label: 'Payee' },
                    { id: 'v_receipt_payment_method', label: 'Payment Method' },
                    { id: 'v_receipt_desc', label: 'Description' },
                    { id: 'v_receipt_check_amount', label: 'Check Amount' }
                ];
            } else if (v_selected === "Check and Cash"){
                fields = [
                    { id: 'v_receipt_payee', label: 'Payee' },
                    { id: 'v_receipt_payment_method', label: 'Payment Method' },
                    { id: 'v_receipt_desc', label: 'Description' },
                    { id: 'v_receipt_cash_amount', label: 'Cash Amount' },
                    { id: 'v_receipt_check_amount', label: 'Check Amount' }
                ];
            } else {
                fields = [
                    { id: 'v_receipt_payee', label: 'Payee' },
                    { id: 'v_receipt_payment_method', label: 'Payment Method' },
                    { id: 'v_receipt_desc', label: 'Description' },
                ];
            }
    
            // Check for empty fields
            var emptyFields = fields.filter(field => !$('#' + field.id).val());

            if (emptyFields.length > 0) {
                var emptyFieldLabels = emptyFields.map(field => field.label).join(', ');
                Swal.fire({
                    html: "Please fill in the following required fields: <strong>" + emptyFieldLabels + "</strong>" ,
                    icon: "warning",
                    buttonsStyling: false,
                    confirmButtonText: "Ok, got it!",
                    customClass: {
                        confirmButton: "btn btn-primary"
                    }
                });
                return;
            }

            // Create the data object to send
            var data = {};
            fields.forEach(field => {
                data[field.id.replace('v_', '')] = $('#' + field.id).val();
            });

            // Set up the headers
            var receiptHeaders = {
                'Authorization': `Bearer `+localStorage.getItem('auth_token'),
            };
    

            axios.post('/api/receipt/add', data, { headers: receiptHeaders })
            .then(response => {
                const responseData = response.data;
                Swal.fire({
                    text: "Receipt saved successfully!",
                    icon: "success",
                    buttonsStyling: false,
                    confirmButtonText: "Ok, got it!",
                    customClass: {
                        confirmButton: "btn btn-primary"
                    }
                });

                clearInputFields(fields);
                $('#receiptModal').modal('hide');
                $('#ofs-receipt-table').DataTable().ajax.reload();
                return responseData;
            })
            .then(data => {
                generateReceiptPDF(data.receipt_id)
            })
            .catch(error => {
                Swal.fire({
                    text: "An error occurred while saving data!",
                    icon: "error",
                    buttonsStyling: false,
                    confirmButtonText: "Ok, got it!",
                    customClass: {
                        confirmButton: "btn btn-primary"
                    }
                });
                console.error(error);
            });

        });
        
        $('#receiptCancel').click(function (event) {
            const receipt_id = $('#v_receipt_id').val();
            
            Swal.fire({
                html: 'Are you sure you want to <span class="badge badge-danger"> CANCEL </span> Receipt <strong>#'+receipt_id+'</strong>?',
                icon: "info",
                buttonsStyling: false,
                showCancelButton: true,
                confirmButtonText: "Confirm",
                cancelButtonText: 'Cancel',
                customClass: {
                    confirmButton: "btn btn-primary",
                    cancelButton: 'btn btn-danger'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    $('#receiptModal').modal('hide');
                    
                    // The confirm button was clicked
                    axios.post(`/api/receipt/cancel/${receipt_id}`, null, {
                        headers: {
                            Authorization: `Bearer `+localStorage.getItem('auth_token'),
                        },
                    }).then(response => {
                        const receiptData = response.data.receipt_id;
                        Swal.fire({
                            html: "Receipt <strong>#"+receiptData+"</strong> successfully cancelled!",
                            icon: "success",
                            buttonsStyling: false,
                            confirmButtonText: "Close",
                            customClass: {
                                confirmButton: "btn btn-primary"
                            }
                        });
                    $('#ofs-receipt-table').DataTable().ajax.reload();

                    })
                    .catch(error => {
                        console.error('Error fetching receipt data:', error);
                    });
                }
            });
        });

        $("#check-all").on('change', function() {
            const isChecked = $(this).prop('checked');
            
            // Select or deselect all checkboxes in the table
            $("#ofs-receipt-table tbody input[type='checkbox']").prop('checked', isChecked);
        });

        $(document).on('change', '#ofs-receipt-table input[type="checkbox"]', function() {
            var checkedValues = [];
            // Iterate over all checkboxes in the table
            $('#ofs-receipt-table').find('input[type="checkbox"]').each(function() {
                if (this.checked) {
                    checkedValues.push(this.value);   
                }
            });

            if (checkedValues.length > 0) {
                // Show the batch update button
                $('#batch-update').removeClass('d-none');
            } else {
                // Hide the batch update button
                $('#batch-update').addClass('d-none');
            }

        });
        
        $('#batchUpdateBtn').click(function (event) {

            var receiptHeaders = {
                'Authorization': `Bearer `+localStorage.getItem('auth_token')
            };
            
            var checkedValue = [];
            accountValue = $('#account').val();
            depositValue = $('#deposit').val();
            // Iterate over all checkboxes in the table
            $('#ofs-receipt-table').find('input[type="checkbox"]').each(function() {
                if (this.checked) {
                    checkedValue.push(this.value);   
                }
            });

            if (checkedValue.length === 0) {
                showAlert("Please select at least one receipt to perform an update.",'warning');
                return;
            }
            if (!accountValue) {
                showAlert("Please select <b>Account</b> first.",'warning');
                return;
            }
            if (!depositValue) {
                showAlert("Please select <b>Bank Account</b> first.",'warning');
                return;
            }

            var data = {
                accountValue: accountValue,
                depositValue: depositValue,
                checkedValue: checkedValue
            };

            axios.post('/api/receipt/accounts-update', data, { headers: receiptHeaders })
            .then(response => {
                const responseData = response.data;
                showAlert("Receipt updated successfully!",'success')

                $('#ofs-receipt-table').DataTable().ajax.reload();
                document.getElementById("check-all").checked = false;
                $('#batch-update').addClass('d-none');
                return responseData;
            }).catch(error => {
                showAlert("An error occurred while updating accounts!",'error')
                console.error(error);
            });
            
        });

    });
// End -- Receipts --

// Start -- Budget Request --
    // Nsa mismong index
// End -- Budget Request --