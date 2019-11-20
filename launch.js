const { fork } = require('child_process');
var Url = require('url-parse');

// Just for simplicity, lets also use an all caps variable name that is more descriptive
process.env.url = process.env.PUBLIC_URL

// Parse database url value
var envDatabaseUrl = process.env.DATABASE_URL || process.env.MYSQL_DATABASE_URL || 'mysql://mysql:410465af8e21033f@dokku-mysql-ghostdb:3306/ghostdb';
var databaseUrl = new Url(envDatabaseUrl);

// Ghost apparently requires mysql
if (databaseUrl.protocol !== 'mysql:') {
    console.log('This script only works for mysql.')
    process.exit(1);
}

// Transform the values from the url, into nconf compatible environment variable names
process.env.database__client = databaseUrl.protocol.replace(':', '');
process.env.database__connection__host = databaseUrl.hostname;
process.env.database__connection__port = databaseUrl.port;
process.env.database__connection__user = databaseUrl.username;
process.env.database__connection__password = databaseUrl.password;
process.env.database__connection__database = databaseUrl.pathname.replace('/', '');

// Transform some server settings
process.env.server__port = process.env.PORT
process.env.server__host = '0.0.0.0'

// Transform some SMTP settings.  This example is for mailgun
process.env.mail__transport = 'SMTP';
process.env.mail__options__service = process.env.SMTP_SERVICE;
process.env.mail__options__host = process.env.SMTP_HOST;
process.env.mail__options__port = process.env.SMTP_PORT;
process.env.mail__options__secureConnection = process.env.SMTP_SECURE || false;
process.env.mail__options__auth__user = process.env.SMTP_USERNAME;
process.env.mail__options__auth__pass = process.env.SMTP_PASSWORD;

// This forked copy is the the only way I could figure out how to make the server get all the environment variables we've set above^
const child = fork('server.js');