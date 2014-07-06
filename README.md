# node-auth-example

Example node.js application with multiple authentication strategies and activity (role)-based authentication

## Authentication
Using [passport.js](http://passportjs.org/). PKI and HTTP basic authentication are supported.

PKI is attempted first. If it succeeds, the user is authenticated. If it fails, HTTP basic authentiation is attempted. If that fails, a HTTP `401` is returned.

A partially-implemented passport PKI strategy is included. It will soon be available as an NPM module.

## Authorisation
Using [connect-roles](https://github.com/ForbesLindesay/connect-roles).

## Examples

For some as-yet-undiagnosed reason `curl` does not perform client authentication against this app (curl 7.30.0, OSX Mavericks). However, `wget` and browsers work as expected. For that reason, PKI examples use `wget` for now.

    curl -k https://localhost:3443/a

 * No credentials provided

Response: `401`


    curl -k --user joe:joepw https://localhost:3443/a

 * No certificate provided - attempt basic authentication
 * Valid username and password provided
 * User `joe` is allowed to `get a`

Response: `200`


    curl -k --user bob:bobpw https://localhost:3443/a

 * No certificate provided - attempt basic authentication
 * Valid username and password provided
 * User `bob` is _not_ allowed to `get a`

Response: `403`  


    wget -O - --no-check-certificate --certificate=ssl/joe.crt --private-key=ssl/joe.key --ca-directory=ssl https://localhost:3443/a

 * Valid certificate provided
 * User `joe` is allowed to `get a`

Response: `200`

Note - `curl -k --cert ssl/joe.crt --key ssl/joe.key --cacert ssl/ca.crt https://localhost:3443/a` currently returns a `401`, and I don't know why.


    wget -O - --no-check-certificate --certificate=ssl/bad_client.crt --private-key=ssl/bad_client.key --ca-directory=ssl https://localhost:3443/a

 * Invalid certificate provided
 * No basic authentication credentials provided

Response: `401`
