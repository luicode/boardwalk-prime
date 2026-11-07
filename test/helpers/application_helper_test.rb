require "test_helper"

class ApplicationHelperTest < ActionView::TestCase
  test "analytics is unconfigured by default and rejects malformed IDs" do
    with_measurement_id(nil) { assert_nil google_analytics_measurement_id }
    with_measurement_id("not-a-measurement-id") { assert_nil google_analytics_measurement_id }
    with_measurement_id('G-TEST<script>') { assert_nil google_analytics_measurement_id }
  end

  test "a valid measurement ID can be passed safely to the website" do
    with_measurement_id("G-85LENK0XR1") do
      assert_equal "G-85LENK0XR1", google_analytics_measurement_id
      rendered = render partial: "shared/analytics_consent"
      assert_includes rendered, "Decline analytics"
      assert_includes rendered, "Allow analytics"
      assert_includes rendered, "data-bp-consent-banner"
      refute_includes rendered, "googletagmanager.com/gtag/js"
    end
  end

  private

  def with_measurement_id(value)
    previous = ENV["GA4_MEASUREMENT_ID"]
    ENV["GA4_MEASUREMENT_ID"] = value
    yield
  ensure
    ENV["GA4_MEASUREMENT_ID"] = previous
  end
end
