var ghost = require('ghost');
var Url = require('url-parse');

process.env.url = process.env.PUBLIC_URL

var envDatabaseUrl = process.env.DATABASE_URL || process.env.MYSQL_DATABASE_URL || '';
var databaseUrl = new Url(envDatabaseUrl);
if (databaseUrl.protocol !== 'mysql') {
    console.log('Ghost requires a mysql database.')
    process.exit(1);
}

process.env.database__client = databaseUrl.protocol;
process.env.database__connection__host = databaseUrl.hostname;
process.env.database__connection__port = databaseUrl.port;
process.env.database__connection__user = databaseUrl.username;
process.env.database__connection__password = databaseUrl.password;
process.env.database__connection__database = databaseUrl.pathname;


// Run a single Ghost process
ghost()
  .then( ghostServer => ghostServer.start() )
  .catch( error => {
    console.error(`Ghost server error: ${error.message} ${error.stack}`);
    process.exit(1);
  });