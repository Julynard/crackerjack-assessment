<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Mail\WelcomeMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class RegisterController extends Controller
{
    public function store(Request $request) {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|unique:users,username',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]);
    
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
    
        $user = User::create([
            'username' => $request->username,
            'name' => $request->name,
            'telephone' => $request->telephone,
            'city' => $request->city,
            'state' => $request->state,
            'address1' => $request->address1,
            'address2' => $request->address2,
            'zip' => $request->zip,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);
        $email = $request->input('email');

        Mail::to($email)->send(new WelcomeMail($user));
        
        return response()->json(['message' => 'User registered successfully', 'name' => $request->username], 201);
    }

}
