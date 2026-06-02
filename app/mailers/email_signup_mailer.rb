class EmailSignupMailer < ApplicationMailer
  TO_RECIPIENTS = [
    "jason@boardwalkcasino.ag",
    "annettelui@gmail.com"
  ].freeze

  BCC_RECIPIENTS = [
    "jefflui7@gmail.com",
    "claireycyang@gmail.com"
  ].freeze

  def admin_notification(email_signup)
    @email_signup = email_signup
    @submitted_at = email_signup.created_at.in_time_zone("America/Antigua").strftime("%B %-d, %Y at %-I:%M %p AST")

    mail(
      to: TO_RECIPIENTS,
      bcc: BCC_RECIPIENTS,
      subject: "New Boardwalk Prime email signup"
    )
  end
end
