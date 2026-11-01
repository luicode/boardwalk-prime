class WelcomeController < ApplicationController
  def home
    today = Time.current.in_time_zone("America/Antigua").to_date
    closure_date = Date.new(2026, 11, 4)
    @show_closure_notice = today <= closure_date
    @closed_for_special_event = today == closure_date
  end
end
