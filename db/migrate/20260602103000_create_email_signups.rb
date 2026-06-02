class CreateEmailSignups < ActiveRecord::Migration[7.2]
  def change
    create_table :email_signups do |t|
      t.string :email, null: false
      t.string :ip_address
      t.string :user_agent

      t.timestamps
    end

    add_index :email_signups, :email
  end
end
