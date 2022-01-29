## Generating Assymmetric Key Pairs

1. Generate JWT private key
```
openssl genrsa -out jwt-key 4096
```

2. Generate JWT public key
```
openssl rsa -in jwt-key -pubout > jwt-key.pub
```

3. Generate JWT refresh private key
```
openssl genrsa -out jwt-refresh-key 4096
```

4. Generate JWT refresh public private key
```
openssl rsa -in jwt-refresh-key -pubout > jwt-refresh-key.pub
```

5. Put them under `auth/auth` directory.