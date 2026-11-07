module ApplicationHelper
  def google_analytics_measurement_id
    value = ENV["GA4_MEASUREMENT_ID"].to_s
    value if value.match?(/\AG-[A-Z0-9]+\z/)
  end
end
