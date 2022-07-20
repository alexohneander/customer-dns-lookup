const config = require('config');

async function startSync() {
    let domains = await getCurrentConfiguredDomains();
}

async function getCurrentConfiguredDomains() {
    let letsEncryptPath = config.letsencrypt.path;
    let letsEncryptConfigPath = letsEncryptPath + '/config/';
    let letsEncryptDomainPath = letsEncryptPath + '/live/';

    let domains = [];
    let configFiles = await fs.readdir(letsEncryptConfigPath);

    console.log(configFiles);
}

startSync();