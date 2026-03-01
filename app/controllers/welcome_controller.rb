class WelcomeController < ApplicationController
  def home
    @menu_sections = [
      {
        key: "starters",
        title: "Starters & Crowd Snacks",
        items: [
          { name: "Salt & Chilli Edamame", price: "8", desc: "Warm edamame tossed in garlic butter, gochujang glaze and toasted sesame." },
          { name: "Tandoori Lollipops + “McGurran Hot Honey”", price: "15", desc: "Robata-kissed chicken lollipops glazed with Korean miso crunch, finished with spiced hot honey." },
          { name: "Crispy Tuna Bites", price: "16", desc: "Sesame-crusted tuna on blistered rice, served warm on stone tile." }
        ]
      },
      {
        key: "maki",
        title: "Maki / Rolls",
        items: [
          { name: "Spicy Tuna Roll", price: "22", desc: "Gochujang, cucumber, scallion oil." },
          { name: "Posh California Roll", price: "23", desc: "Lobster, avocado, citrus mayo, tobiko." },
          { name: "Crispy Shrimp Tempura Roll", price: "21", desc: "Sweet soy, chilli threads." }
        ]
      },
      {
        key: "steakhouse",
        title: "Steakhouse of the East",
        items: [
          { name: "Lake District Farms Ribeye (16oz)", price: "68", desc: "Robata char, chimichurri." },
          { name: "USDA Prime NY Strip (14oz)", price: "62", desc: "Black pepper teriyaki." },
          { name: "Coffee-Miso Dry-Aged Tomahawk (32oz, Two)", price: "155", desc: "Carved tableside; marrow butter." }
        ]
      },
      {
        key: "desserts",
        title: "Desserts",
        items: [
          { name: "Baked Alaska", price: "15", desc: "Torched tableside." },
          { name: "Pistachio Soufflé", price: "14", desc: "Anglaise poured tableside." },
          { name: "Crème Brûlée Tonka Bean", price: "12", desc: "" }
        ]
      }
    ]
  end
end