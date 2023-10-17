<!DOCTYPE html>

<html lang="en">
	<head><base href=""/>
		<title>Assesstment - Crackerjack</title>
		<meta charset="utf-8" />
		<meta name="description" content="Church of God Online Finance System" />
		<meta name="keywords" content="COG OFS" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<meta property="og:locale" content="en_US" />
		<meta property="og:type" content="article" />
		<meta property="og:title" content="COG OFS" />
		<meta property="og:url" content="https://cogdasma.com/" />
		<meta property="og:site_name" content="COG | OFS" />
		<link rel="canonical" href="https://cogdasma.com/" />
		<link rel="shortcut icon" href="{{ asset('assets/media/logos/ofs-logo-1.ico') }}" />
		<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Inter:300,400,500,600,700" />
		<link href="assets/plugins/global/plugins.bundle.css" rel="stylesheet" type="text/css" />
		<link href="assets/css/style.bundle.css" rel="stylesheet" type="text/css" />
	</head>
	<body id="kt_body" class="app-blank">
		<div class="d-flex flex-column flex-root" id="kt_app_root">
			<div class="d-flex flex-column flex-lg-row flex-column-fluid">
				<div class="d-flex flex-column flex-lg-row-fluid w-lg-50 p-10 order-2 order-lg-1">
					<div class="d-flex flex-center flex-column flex-lg-row-fluid">
						<div class="w-lg-500px p-10">
							<form class="form w-100" novalidate="novalidate" id="kt_sign_in_form" data-kt-redirect-url="{{ route('thankyou')}}" action="#">
                                <div class="row">
                                    <div class="text-center mb-11">
                                        <h1 class="text-dark fw-bolder mb-3">Register</h1>
                                    </div>
                                    <div class="fv-row mb-8">
                                        <input type="text" placeholder="Name" name="name" id="name" autocomplete="off" class="form-control bg-transparent" />
                                    </div>
                                    <div class="fv-row mb-8">
                                        <input type="text" placeholder="Email" name="email" id="email" autocomplete="off" class="form-control bg-transparent" />
                                    </div>
                                    <div class="col-md-6">
                                        <div class="fv-row mb-8">
                                            <input type="tel" placeholder="Telephone" id="telephone" name="telephone" autocomplete="off" class="form-control bg-transparent">
                                        </div>
                                        <div class="fv-row mb-8">
                                            <input type="text" placeholder="Address 1" name="address1" id="address1" autocomplete="off" class="form-control bg-transparent" />
                                        </div>
                                        <div class="fv-row mb-8">
                                            <input type="text" placeholder="Address 2" name="address2" id="address2" autocomplete="off" class="form-control bg-transparent" />
                                        </div>
                                    </div>
                                    <div class="col-md-6">

                                        <div class="fv-row mb-8">
                                            <input type="text" placeholder="City" name="city" id="city" autocomplete="off" class="form-control bg-transparent" />
                                        </div>
                                        <div class="fv-row mb-8">
                                            <input type="text" placeholder="State/Province" name="state" id="state" autocomplete="off" class="form-control bg-transparent" />
                                        </div>
                                        <div class="fv-row mb-8">
                                            <input type="text" placeholder="Zip" name="zip" id="zip" autocomplete="off" class="form-control bg-transparent" />
                                        </div>
                                    </div>
                                    <div class="fv-row mb-8">
                                        <input type="text" placeholder="Username" name="username" id="username" autocomplete="off" class="form-control bg-transparent" />
                                    </div>
                                    <div class="fv-row mb-8">
                                        <input type="password" placeholder="Password" name="password" id="password" autocomplete="off" class="form-control bg-transparent"/>
                                    </div>
                                    <div class="fv-row mb-8">
                                        <input type="password" placeholder="Confirm Password" name="confirm_password" id="confirm_password" autocomplete="off" class="form-control bg-transparent"/>
                                    </div>
                                    <div class="d-grid mb-10">
                                        <button type="submit" id="kt_sign_in_submit" class="btn btn-primary">
                                            <span class="indicator-label">Register</span>
                                            <span class="indicator-progress">Please wait...
                                            <span class="spinner-border spinner-border-sm align-middle ms-2"></span></span>
                                        </button>
                                    </div>
                                    <div id="errorMessage" style="color: red;"></div>
                                </div>
                            </form>
                            
						</div>
					</div>
				</div>
			</div>
		</div>
		<script>var hostUrl = "assets/";</script>
		<script src="assets/plugins/global/plugins.bundle.js"></script>
		<script src="assets/js/scripts.bundle.js"></script>
		<script src="assets/js/custom/authentication/sign-in/general.js"></script>
	</body>
</html>