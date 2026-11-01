require "test_helper"

class WelcomeControllerTest < ActionDispatch::IntegrationTest
  test "shows the special event notice before November 4" do
    travel_to Time.utc(2026, 11, 1, 16) do
      get root_path

      assert_response :success
      assert_select "#bp-opening-title", "Open Now"
      assert_select ".bp-opening .bp-closure-notice", text: /Closed November 4\s+For a special event/
    end
  end

  test "shows closed today through the end of November 4 in Antigua" do
    travel_to Time.utc(2026, 11, 5, 3, 59, 59) do
      get root_path

      assert_response :success
      assert_select "#bp-opening-title", "Closed Today"
      assert_select ".bp-closure-notice", count: 1
    end
  end

  test "removes the notice at midnight on November 5 in Antigua" do
    travel_to Time.utc(2026, 11, 5, 4) do
      get root_path

      assert_response :success
      assert_select "#bp-opening-title", "Open Now"
      assert_select ".bp-closure-notice", count: 0
    end
  end

  test "does not repeat the closure the following year" do
    travel_to Time.utc(2027, 11, 4, 16) do
      get root_path

      assert_select "#bp-opening-title", "Open Now"
      assert_select ".bp-closure-notice", count: 0
    end
  end
end
