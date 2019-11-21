# Ghost 3.0 on Dokku

Ghost-on-Dokku will enable you to more easily deploy Ghost v3 on a Dokku host.  I was inspired by [ghost-on-heroku](https://github.com/snathjr/ghost-on-heroku), but I needed to update some of the settings to work on Dokku, and I had an idea on how to accomplish this without writing to a config file.

The crux of this project is transforming dokku-type environment variables into nconf-type environment variables.  Even though the Ghost docs describe a config file, and provide an example config, etc. I wanted to re-make this deployment a bit following [12 factor principles](https://12factor.net/).  The best example of what I'm talking about is where you store the database authentication password.  With [Ghost's config](https://ghost.org/docs/concepts/config/#database) you would need to write the password into the config file like so:

```json
"database": {
  "connection": {
    // ...
    "password": "your_database_password"
  }
}
```

Or you could alternatively use nconf's nested environment variable syntax:

```
database__connection__password=your_database_password
```

So when using Dokku, when you ['link'](https://github.com/dokku/dokku-mysql#usage) a database, your dokku app will get a config variable that looks like this:

```
DATABASE_URL=mysql://db_username:your_database_password@db_host:db_port/db_name
```

The way this project executes with `npm start`, is to call `launch.js`.  Inside `launch.js` you can see how we're parsing that DATABASE_URL into nconf environment variables.  After all the transforms we fork the process and call `server.js` which imports `ghost()` and runs it.  I'm not 100% sure if this is the best way to do this, but it works, and I'm Just-Having-Fun™.

## How to Deploy

Deployment should be pretty straight-forward, and work just like you would expect for a web application with a database attached.  I won't go into the details because there are better docs for that, but this should be the minimum set of commands:

```sh
git clone https://github.com/pwalker/ghost-on-dokku
cd ghost-on-dokku
dokku apps:create blog
dokku mysql:create blog_db
dokku mysql:link blog blog_db
dokku domains:set blog.example.com
dokku letsencrypt # extra credit
dokku config:set # ALL_RELEVANT_ENVIRONMENT_VARIABLES_DESCRIBED_BELOW
git push dokku master
```

### Important environment variables

The Ghost docs describe 3 things being critical to running the app in production.  A URL, your database config, and your email sending config.

First off pick your public url with `PUBLIC_URL`:

```
PUBLIC_URL=blog.example.com
```

You shouldn't need to mess with the `DATABASE_URL` at all, since this is set when you call `dokku mysql:link ...`

And here is an example set of SMTP variables, and this should cover all the relevant settings.  This is what I used to work with Mailgun, but it should be similar for other hosts.

```
SMTP_HOST=smtp.mailgun.org
SMTP_PASSWORD=your_smtp_password_here
SMTP_PORT=465
SMTP_SECURE=true
SMTP_SERVICE=Mailgun
SMTP_USERNAME=your_smtp_username@example.com
```

One important caveat of this project is that you we aren't using a config.json at all.  If you want to use other configuration settings described in the docs, you'll need to set the appropriate nconf-type environment variable, or add a transform to `launch.js`.

## Upcoming work

- [ ] Specify how to deploy with assets stored in S3, or some other S3 compatible storage like a selfhosted min.io instance
- [ ] Allow using a config.json file.  Normal config values should go into the file, while credentials and secrets should stay in the environment.