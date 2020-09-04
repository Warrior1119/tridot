const obj = {
    package: {
        version: process.env.npm_package_version,
    }
};

const jsonText = JSON.stringify(obj, null, 2) // pretty print
const fs = require('fs');
fs.writeFile('./src/app-info.ts', `export const APP_INFO = ${jsonText};`, function (err) {
    if (err) {
        return console.log(err);
    }
});

console.log('File [app-info.ts] written successfully.')
console.log(jsonText);
