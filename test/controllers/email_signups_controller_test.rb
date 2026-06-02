require "test_helper"

class EmailSignupsControllerTest < ActionDispatch::IntegrationTest
  test "creates email signup and enqueues admin notification" do
    assert_enqueued_emails 1 do
      assert_difference "EmailSignup.count", 1 do
        post email_signups_path,
          params: { email_signup: { email: "guest@example.com" } },
          as: :json
      end
    end

    assert_response :created
    assert_equal "guest@example.com", EmailSignup.last.email
  end

  test "rejects invalid email" do
    assert_no_enqueued_emails do
      assert_no_difference "EmailSignup.count" do
        post email_signups_path,
          params: { email_signup: { email: "invalid" } },
          as: :json
      end
    end

    assert_response :unprocessable_entity
  end
end
