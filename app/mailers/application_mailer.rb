class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch("MAIL_FROM", "Boardwalk Prime <boardwalkcasinoantigua@gmail.com>")
  layout "mailer"
end
