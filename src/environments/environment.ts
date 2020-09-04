
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  MOCK_ENDPOINT: "https://api.myjson.com/bins/",
  API_ENDPOINT: "https://stageapi.tridot.com",
  E2E_APP_URL: "https://stage.tridot.com",
  scripts: [
    {
      // name: 'walkMe',
      // src: 'https://cdn.walkme.com/users/5d79f490143f4d968c52392af67ec09b/test/walkme_5d79f490143f4d968c52392af67ec09b_https.js'
    }
  ]
};
