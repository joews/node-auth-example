#!/bin/sh
# Do not follow these steps to create production certs!
openssl genrsa -out ca.key 4096
openssl req -new -x509 -days 9999 -key ca.key -out ca.crt
openssl genrsa -out server.key 1024
openssl req -new -key server.key -out server.csr
openssl x509 -req -days 9999 -in server.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out server.crt
openssl genrsa -out client.key 1024
openssl req -new -key client.key -out client.csr
openssl x509 -req -days 9999 -in client.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out client.crt
