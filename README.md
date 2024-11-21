# How To Run
Place config.env file into server folder then run:
```
docker-compose up --build
```

# Admin Account
Username
```
admin3900
```
Password
```
sleepy
```

# Testing
## Frontend:
Start the docker first, then run:
```
cd client
npm install
```
To test in the command line:
```
npm test
```
To test in the UI:
```
npx cypress open
```

## Backend:
```
cd server
npm install
npm test
```