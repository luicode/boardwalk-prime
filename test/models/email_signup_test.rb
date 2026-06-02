require "test_helper"

class EmailSignupTest < ActiveSupport::TestCase
  test "validates email format" do
    signup = EmailSignup.new(email: "not an email")

    assert_not signup.valid?
    assert_includes signup.errors[:email], "is invalid"
  end

  test "normalizes email before validation" do
    signup = EmailSignup.create!(email: "  TEST@Example.COM  ")

    assert_equal "test@example.com", signup.email
  end
end
