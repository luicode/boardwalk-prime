class EmailSignupsController < ApplicationController
  def create
    email_signup = EmailSignup.new(email_signup_params)
    email_signup.ip_address = request.remote_ip
    email_signup.user_agent = request.user_agent

    if email_signup.save
      render json: { message: "Thank you for your e-mail. We'll be in touch!" }, status: :created
    else
      render json: { errors: email_signup.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def email_signup_params
    params.require(:email_signup).permit(:email)
  end
end
