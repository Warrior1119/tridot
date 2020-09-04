# Tridot Athlete Portal

Tridot Athlete Portal is new version TriDot App. This is PWA enabled app.

## Pre-requisites

Install below before setting running the app on local machine.

Node version: v10.x.x
NPM Version: v6.9.x

## NPM Registry Configuration

We have some custom libraries. So we need to login to github package to install dependencies as mentioned below:
 
** Login to the github packages as below, please note it would require a token instead of password when prompetd for password. So create a personal token as mentioned at: https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line
```
npm login --registry=https://npm.pkg.github.com
```

## Development server

Run below commands:

`npm install` (Only for the first time or if any change in package.json)
`npm run dev`

* Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
* By default this will point to Stage environment API. 
* To change to local API or any other environment, modify `API_ENDPOINT` in `environment.ts`. 

## Common Coding Guidelines

* Always use HttpClient instead of Http module. This will give the features of using interceptors also Http module is deprecated.
* No need to pass Authentication Header part of every request as Header is sent from AuthInterceptor for every Request.
* No need to handle Session Expiry as it is taken care in AuthINterceptor in common.
* Use `LocalstorageService.getAthleteProfileIfExists()` whenever required to access profile data from localStorage.
* Use `LocalstorageService.getAccessToken()` whenever required to access accessToken.
* Use `LocalstorageService.getMemberId()` whenere required to access logged in athleteId.


