require "test_helper"

class EmailSignupMailerTest < ActionMailer::TestCase
  test "admin notification" do
    signup = EmailSignup.new(email: "guest@example.com", created_at: Time.current)
    mail = EmailSignupMailer.admin_notification(signup)

    assert_equal ["jason@boardwalkcasino.ag", "annettelui@gmail.com", "jefflui7@gmail.com", "claireycyang@gmail.com"], mail.to
    assert_equal ["boardwalkcasinoantigua@gmail.com"], mail.from
    assert_equal "New Boardwalk Prime email signup", mail.subject
    assert_match "guest@example.com", mail.body.encoded
  end
end
