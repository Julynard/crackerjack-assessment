<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## Step by Step guide

1. Clone this: https://github.com/Julynard/crackerjack-assessment 
2. Go to project folder then remove the word <b>'.example'</b> in <b>'.env'</b> file name.
3. run the '<b>composer install</b>'. (if you dont have go to google just search download composer)
4. Inside the folder, open command prompt then run <b>'php artisan migrate'</b> - <i>This command covers already the MySQL programming test and Laravel test for creating DB and migration script.</i>
5. When done run command <b>'php artisan serve'</b>

## What to expect
1. Upon running serve http://127.0.0.1:8000/, Registration Page with clean registration form will appear
2. Both have client-side and server-side validation of inputs.
3. You can use this site https://temp-mail.org/en/ to generate fake email. 
4. Fill up the registration form and click 'Submit'. If success you will be redirected to Thank you page with email sent.

## File Location 
1. JS File - public/asset/js/custom/authentication/sign-in/general.js
2. CSS File - public/asset/css/custom/style.bundle.css
3. Blade File - /views folder 
4. Route File - /routes folder