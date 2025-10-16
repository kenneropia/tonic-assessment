# Tonic Bank API Authentication Flow

## Overview

The Tonic Bank API uses a JWT-based authentication system with access and refresh tokens.

## Authentication Flow

1. **User Registration (Signup)**
   - User creates an account with email, password, and personal information
   - System creates a new user record and returns user details

2. **User Login (Signin)**
   - User provides email and password
   - System validates credentials and issues:
     - Short-lived access token (15 minutes)
     - Long-lived refresh token (7 days)

3. **Accessing Protected Resources**
   - Client includes access token in Authorization header
   - Format: `Authorization: Bearer {access_token}`
   - System validates token for each protected request

4. **Token Renewal**
   - When access token expires, client uses refresh token to get a new one
   - Client calls `/auth/refresh-token` with refresh token
   - System issues a new access token if refresh token is valid

5. **Logout (Signout)**
   - Client calls `/auth/signout` with access token
   - System invalidates the refresh token
   - Client discards both tokens

## Security Considerations

- Access tokens are short-lived (15 minutes) to minimize risk if compromised
- Refresh tokens are long-lived (7 days) but can be revoked
- All authentication endpoints are rate-limited to prevent brute force attacks
- Passwords are hashed using argon before storage