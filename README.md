# README

This README would normally document whatever steps are necessary to get the
application up and running.

Things you may want to cover:

* Ruby version

* System dependencies

* Configuration

* Database creation

* Database initialization

* How to run the test suite

* Services (job queues, cache servers, search engines, etc.)

* Deployment instructions

* ...

## Production Email

Email signup admin notifications are sent with Rails ActionMailer. Production
mail delivery is enabled in `config/environments/production.rb` and defaults to
SMTP.

For the Boardwalk Casino Antigua Gmail sender, set these environment variables
in production:

```sh
APP_HOST=boardwalkprime.com
MAIL_DELIVERY_METHOD=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_DOMAIN=gmail.com
SMTP_USERNAME=boardwalkcasinoantigua@gmail.com
SMTP_PASSWORD=your-google-app-password
SMTP_AUTHENTICATION=plain
SMTP_ENABLE_STARTTLS_AUTO=true
MAIL_FROM="Boardwalk Prime <boardwalkcasinoantigua@gmail.com>"
```

If the production server has a local mail transfer agent such as sendmail or
postfix, use:

```sh
MAIL_DELIVERY_METHOD=sendmail
SENDMAIL_LOCATION=/usr/sbin/sendmail
SENDMAIL_ARGUMENTS=-i
```
