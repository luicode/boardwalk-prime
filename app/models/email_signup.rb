class EmailSignup < ApplicationRecord
  after_create_commit :notify_admins

  before_validation :normalize_email

  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }

  private

  def normalize_email
    self.email = email.to_s.strip.downcase
  end

  def notify_admins
    EmailSignupMailer.admin_notification(self).deliver_later
  end
end
