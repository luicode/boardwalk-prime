require "test_helper"

class EmailSignupMailerTest < ActionMailer::TestCase
  test "admin notification" do
    signup = EmailSignup.new(email: "guest@example.com", created_at: Time.utc(2026, 6, 2, 14, 30))
    mail = EmailSignupMailer.admin_notification(signup)

    assert_equal ["jason@boardwalkcasino.ag", "annettelui@gmail.com"], mail.to
    assert_equal ["jefflui7@gmail.com", "claireycyang@gmail.com"], mail.bcc
    assert_equal ["boardwalkcasinoantigua@gmail.com"], mail.from
    assert_equal "New Boardwalk Prime email signup", mail.subject
    assert_match "guest@example.com", mail.body.encoded
    assert_match "June 2, 2026 at 10:30 AM AST", mail.body.encoded
  end
end
