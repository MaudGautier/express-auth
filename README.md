# Simple authentication

This is a basic user/password authentication app that was implemented for learning purposes.

The idea for doing this comes from p.b. hua, who live coded an equivalent app during a presentation she gave.
I later re-implemented it on my own to make sure I had understood everything she talked about.
So all the credits for this code goes to her!

## Getting started

```shell
# Install dependencies
npm install

# Run the app
npm run dev

# Go to http://localhost:5001/ and play with the app
```

## What's in there?

This app contains three html pages:

- a login page (http://localhost:5001/login)
- a registration page (http://localhost:5001/register)
- a home page (http://localhost:5001/home)

We can access the home page only if we are authenticated.

This was done in several incremental steps:

1. Store username/password credentials in plain text in an in-memory database:
    - When submitting the form on the registration page: add the username/password in the database
    - When submitting the form on the login page: check that entered username/password correspond to one in the database
2. Store an encrypted password instead of plain text (use the `argon2` library to do this):
    - Encryption when adding the credentials on the registration page
    - Decryption when checking the credentials on the login page
3. Implement session-based authentication to avoid having to re-login everytime:
    - When logging in: generate a new unique sessionID, store it in the database together with the associated user, and
      add a cookie containing the sessionID so that we can perform session-based authentication afterward
    - When accessing the home page: read cookies and extract the sessionId (if present). If it is, then we can check
      that it corresponds to an existing user. If so, we grant access to the page. Otherwise, we redirect to the login
      page.

