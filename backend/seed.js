const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./model/User");
const Product = require("./model/Product");
const Order = require("./model/Order");

const products = [
  {
    name: "Wireless Noise-Cancelling Headphones",
    description:
      "Comfortable over-ear headphones with active noise cancellation and 30-hour battery life.",
    price: 8990,
    category: "Electronics",
    stock: 18,
    imageURL:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    rating: 4.7,
    numReviews: 126,
  },
  {
    name: "Smart Watch Series 5",
    description:
      "Fitness tracking smartwatch with heart-rate monitoring and a bright AMOLED display.",
    price: 6490,
    category: "Electronics",
    stock: 24,
    imageURL:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    rating: 4.5,
    numReviews: 89,
  },
  {
    name: "Minimal Leather Backpack",
    description:
      "Water-resistant everyday backpack with a padded laptop sleeve and roomy main compartment.",
    price: 3290,
    category: "Fashion",
    stock: 35,
    imageURL:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    rating: 4.4,
    numReviews: 58,
  },
  {
    name: "Ceramic Coffee Mug Set",
    description:
      "Set of four matte ceramic mugs, perfect for tea, coffee, and hot chocolate.",
    price: 1290,
    category: "Home & Kitchen",
    stock: 50,
    imageURL:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=80",
    rating: 4.6,
    numReviews: 73,
  },
  {
    name: "Ergonomic Office Chair",
    description:
      "Adjustable mesh office chair with lumbar support and smooth-rolling wheels.",
    price: 12500,
    category: "Furniture",
    stock: 12,
    imageURL:
      "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=800&q=80",
    rating: 4.3,
    numReviews: 41,
  },
  {
    name: "Portable Bluetooth Speaker",
    description:
      "Compact waterproof speaker with rich sound and up to 12 hours of playtime.",
    price: 2490,
    category: "Electronics",
    stock: 40,
    imageURL:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80",
    rating: 4.5,
    numReviews: 94,
  },
  {
    name: "Organic Cotton T-Shirt",
    description:
      "Soft, breathable regular-fit cotton t-shirt for everyday comfort.",
    price: 890,
    category: "Fashion",
    stock: 70,
    imageURL:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    rating: 4.2,
    numReviews: 66,
  },
  {
    name: "Stainless Steel Water Bottle",
    description:
      "Insulated 750 ml bottle that keeps drinks cold for 24 hours or hot for 12 hours.",
    price: 990,
    category: "Home & Kitchen",
    stock: 65,
    imageURL:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
    rating: 4.6,
    numReviews: 112,
  },
  {
    name: "The Everyday Sneakers",
    description:
      "Lightweight casual sneakers with cushioned soles and breathable knit uppers.",
    price: 3990,
    category: "Footwear",
    stock: 28,
    imageURL:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    rating: 4.4,
    numReviews: 77,
  },
  {
    name: "Desk LED Lamp",
    description:
      "Dimmable desk lamp with adjustable color temperature and USB charging port.",
    price: 1790,
    category: "Home & Kitchen",
    stock: 22,
    imageURL:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    rating: 4.3,
    numReviews: 39,
  },
];

async function upsertUser(user) {
  return User.findOneAndUpdate(
    { email: user.email },
    { $set: user },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
}

async function seedDatabase() {
  if (!process.env.MONGO_URI) {
    throw new Error(
      "MONGO_URI is missing. Add it to backend/.env before seeding.",
    );
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  const password = await bcrypt.hash("Password123!", 10);
  const [admin, customer] = await Promise.all([
    upsertUser({
      name: "ShopNest Admin",
      email: "admin@shopnest.test",
      password,
      role: "admin",
      verified: true,
    }),
    upsertUser({
      name: "Demo Customer",
      email: "customer@shopnest.test",
      password,
      role: "user",
      verified: true,
    }),
  ]);

  const seededProducts = await Promise.all(
    products.map((product) =>
      Product.findOneAndUpdate(
        { name: product.name },
        { $set: product },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      ),
    ),
  );

  const orders = [
    {
      user: customer._id,
      items: [
        {
          productId: seededProducts[0]._id,
          quantity: 1,
          price: seededProducts[0].price,
        },
        {
          productId: seededProducts[7]._id,
          quantity: 2,
          price: seededProducts[7].price,
        },
      ],
      totalAmount: seededProducts[0].price + seededProducts[7].price * 2,
      address: {
        fullname: "Demo Customer",
        street: "123 Lake Road",
        city: "Dhaka",
        postalcode: "1205",
        country: "Bangladesh",
      },
      paymentId: "demo-payment-1001",
      status: "deliverd",
    },
    {
      user: customer._id,
      items: [
        {
          productId: seededProducts[4]._id,
          quantity: 1,
          price: seededProducts[4].price,
        },
      ],
      totalAmount: seededProducts[4].price,
      address: {
        fullname: "Demo Customer",
        street: "123 Lake Road",
        city: "Dhaka",
        postalcode: "1205",
        country: "Bangladesh",
      },
      paymentId: "demo-payment-1002",
      status: "shipped",
    },
  ];

  await Promise.all(
    orders.map((order) =>
      Order.findOneAndUpdate(
        { paymentId: order.paymentId },
        { $set: order },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      ),
    ),
  );

  console.log(
    `Seed complete: 2 users, ${seededProducts.length} products, ${orders.length} orders.`,
  );
  console.log(
    "Demo login: admin@shopnest.test or customer@shopnest.test / Password123!",
  );
  console.log(`Admin account created: ${admin.email}`);
}

seedDatabase()
  .catch((error) => {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
