#!/bin/sh
# Do not follow these steps to create production certs!

# Self-signed CA key/cert
openssl genrsa -out ca.key 2048
openssl req -new -x509 -key ca.key -out ca.crt <<END
.
.
.
.
.
CA
.
END

# Server key/cert
openssl genrsa -out server.key 1024
openssl req -new -key server.key -out server.csr <<END
.
.
.
.
.
localhost
.
.
.
END
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt

# Client key/cert for user 'joe'
openssl genrsa -out client.key 1024
openssl req -new -key client.key -out client.csr <<END
.
.
.
.
.
joe
.
.

END
openssl x509 -req -in client.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out client.crt

# pkcs12 cert for browser/OS keychain import
openssl pkcs12 -export -in client.crt -inkey client.key -name "node-auth-example client cert" -out client.p12

# Self-signed certificate - should fail authentiation
openssl genrsa -out bad_client.key 1024
penssl req -new -key bad_client.key -out bad_client.csr <<END
.
.
.
.
.
bad client
.
.
END
openssl x509 -req -in bad_client.csr -signkey bad_client.key -out bad_client.crt
