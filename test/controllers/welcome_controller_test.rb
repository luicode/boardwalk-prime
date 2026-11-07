require "test_helper"

class WelcomeControllerTest < ActionDispatch::IntegrationTest
  test "menu is the first secondary link and contains every separate PDF page" do
    get root_path

    assert_response :success
    assert_select ".bp-secondary-links > :first-child[data-bp-modal-open='bp-menu-modal']", text: /Menu/
    assert_select "dialog#bp-menu-modal[aria-labelledby='bp-menu-title']" do
      assert_select "[data-bp-menu-leaf]", count: 3
      (1..3).each do |page|
        assert_select "a[href='/menus/boardwalk-prime/page-#{page}.pdf']", count: 1
        assert_select "img[data-src='/menus/boardwalk-prime/page-#{page}.webp']", count: 1
      end
      assert_select "[data-bp-menu-prev][disabled]"
      assert_select "a[href='/menus/boardwalk-prime/menu.pdf']"
    end
  end

  test "shows the special event notice before November 4" do
    travel_to Time.utc(2026, 11, 1, 16) do
      get root_path

      assert_response :success
      assert_select "#bp-opening-title", "Open Now"
      assert_select ".bp-opening .bp-closure-notice", text: /Closed on Wednesday, November 4\s+Special event/
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
