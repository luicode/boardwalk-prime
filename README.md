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

## Website analytics

Google Analytics 4 is enabled when `GA4_MEASUREMENT_ID` is configured (production:
`G-85LENK0XR1`, Boardwalk Prime Website). Leave it unset locally to avoid counting
development traffic. There is one Google tag, loaded only after analytics consent.
The Privacy & cookies control lets visitors change their choice; revocation stops
measurement and removes this site's GA cookies. Advertising consent, Google
Signals, and advertising personalisation remain disabled.

GA4 provides traffic sources/campaigns, sessions, engagement, approximate geography,
and device/browser reports. The stream also measures scrolls and PDF file clicks.
Custom events are `menu_open`, `menu_page_view` (menu_page/menu_section),
`menu_pdf_open` (menu_document/menu_page), `reservation_click` (booking_provider),
`contact_click` (contact_method), `social_click` (social_network), `newsletter_open`,
`hours_open`, and `about_open`. Page views account for Rails Turbo navigation without
double-counting the initial load. Arbitrary query parameters, fragments, referrer
queries, link text, and form inputs are not sent by custom tracking.

Reservation clicks and newsletter opens measure intent only: the OpenTable
cross-origin service does not expose completed bookings/subscriptions to this site.
Do not report these events as confirmed bookings or newsletter signups.

Run the consent/event tests with `node --test test/javascript/analytics_test.mjs`
and the Rails tests with `bundle exec rails test`.
