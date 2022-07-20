const config = require('config');
const path = require('path');
const dns = require('dns');
const fs = require('fs');
const winston = require('winston');


const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.json(),
        winston.format.colorize(),
        winston.format.timestamp()
    ),
    transports: [
        //
        // - Write all logs with importance level of `error` or less to `error.log`
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

// Setting options for dns.lookup() method
const dnsLookupOptions = {
    // Setting family as 6 i.e. IPv6
    family: 4,
    hints: dns.ADDRCONFIG | dns.V4MAPPED,
};

async function startSync() {
    let domainConfigs = await getCurrentConfiguredDomains();
    logger.info(`Current configured domains: ${domainConfigs.length}`);

    // check if domains point to the correct service ip addresses
    for (let domainConfig of domainConfigs) {
        let domains = await getDomainsFromConfig(domainConfig);

        // get current ip address for domain
        for (let domain of domains) {
            await getCurrentIpAddress(domain);
        }
    }
}

async function getCurrentConfiguredDomains() {
    let letsEncryptConfigPath = config.letsencrypt.path + 'configs/';
    let files = await fs.readdirSync(letsEncryptConfigPath);
    let domainConfigs = [];

    for (let file of files) {
        let config = letsEncryptConfigPath + file;
        domainConfigs.push(config);
    }

    return domainConfigs;
}

async function getDomainsFromConfig(config) {
    let domains = [];
    let lines = await fs.readFileSync(config).toString().split('\n');
    for (let line of lines) {
        if (line.startsWith('domains')) {
            let domainString = line.split(' ')[2];
            let domain = domainString.replace(',', '');
            domains.push(domain);

            if (line.split(' ')[3] !== "" && line.split(' ')[3] !== undefined) {
                let altDomain = line.split(' ')[3];
                domains.push(altDomain);
            }
        }
    }
    return domains;
}

async function getCurrentIpAddress(domain) {
    await dns.resolve4(domain, dnsLookupOptions, (err, addresses) => {
        if (err) {
            console.log(`${domain} is not resolved`);
        } else {
            for (address of addresses) {
                if (config.service.addresses.includes(address)) {
                    logger.info(`${domain} is pointing to the correct ip address: ${address}`);
                } else {
                    logger.error(`${domain} is pointing to the wrong ip address: ${address}`);
                }
            }
        }
    });
}

startSync();