import { Prisma } from "../src/generated/prisma/client";
import { prisma } from "../src/lib/prisma";

// ---------- Categories ----------
const categoryData: Prisma.CategoryCreateInput[] = [
  { name: "Appetizers" },
  { name: "Main Course" },
  { name: "Desserts" },
  { name: "Beverages" },
];

// ---------- Images ----------
const imageData: Prisma.ImageCreateInput[] = [
  { path: "/uploads/images/banner-promo.jpg" },
  { path: "/uploads/images/restaurant-interior.jpg" },
  { path: "/uploads/images/chef-special.jpg" },
];

// ---------- Restaurant Tables ----------
const restaurantTableData: Prisma.RestaurantTableCreateInput[] = [
  { tableNumber: 1, qrCode: "QR-TABLE-001", status: "AVAILABLE" },
  { tableNumber: 2, qrCode: "QR-TABLE-002", status: "AVAILABLE" },
  { tableNumber: 3, qrCode: "QR-TABLE-003", status: "OCCUPIED" },
  { tableNumber: 4, qrCode: "QR-TABLE-004", status: "AVAILABLE" },
  { tableNumber: 5, qrCode: "QR-TABLE-005", status: "OCCUPIED" },
];

async function main() {
  console.log("Start seeding...");

  console.log("Seeding categories...");
  const categories: Record<string, number> = {};
  for (const c of categoryData) {
    const category = await prisma.category.create({ data: c });
    categories[category.name] = category.id;
  }

  console.log("Seeding images...");
  for (const i of imageData) {
    await prisma.image.create({ data: i });
  }

  console.log("Seeding menu items...");
  const menuItemData: Prisma.MenuItemCreateInput[] = [
    {
      name: "Spring Rolls",
      description:
        "Crispy vegetable spring rolls served with sweet chili sauce",
      price: new Prisma.Decimal(5.99),
      image: "/uploads/images/spring-rolls.jpg",
      category: { connect: { id: categories["Appetizers"] } },
    },
    {
      name: "Chicken Wings",
      description:
        "Grilled or fried chicken wings tossed in your choice of sauce",
      price: new Prisma.Decimal(8.5),
      image: "/uploads/images/chicken-wings.jpg",
      category: { connect: { id: categories["Appetizers"] } },
    },
    {
      name: "Grilled Salmon",
      description:
        "Fresh Atlantic salmon grilled to perfection with lemon butter",
      price: new Prisma.Decimal(18.99),
      image: "/uploads/images/grilled-salmon.jpg",
      category: { connect: { id: categories["Main Course"] } },
    },
    {
      name: "Classic Beef Burger",
      description:
        "Juicy beef patty with lettuce, tomato, cheese, and house sauce",
      price: new Prisma.Decimal(12.5),
      image: "/uploads/images/beef-burger.jpg",
      category: { connect: { id: categories["Main Course"] } },
    },
    {
      name: "Margherita Pizza",
      description: "Classic pizza with tomato, mozzarella, and fresh basil",
      price: new Prisma.Decimal(14.0),
      image: "/uploads/images/margherita-pizza.jpg",
      category: { connect: { id: categories["Main Course"] } },
    },
    {
      name: "Chocolate Lava Cake",
      description:
        "Warm chocolate cake with a molten center, served with ice cream",
      price: new Prisma.Decimal(6.99),
      image: "/uploads/images/chocolate-lava-cake.jpg",
      category: { connect: { id: categories["Desserts"] } },
    },
    {
      name: "New York Cheesecake",
      description: "Rich and creamy cheesecake with a graham cracker crust",
      price: new Prisma.Decimal(6.5),
      image: "/uploads/images/cheesecake.jpg",
      category: { connect: { id: categories["Desserts"] } },
    },
    {
      name: "Iced Tea",
      description: "Refreshing house-brewed iced tea",
      price: new Prisma.Decimal(3.0),
      image: "/uploads/images/iced-tea.jpg",
      category: { connect: { id: categories["Beverages"] } },
    },
    {
      name: "Fresh Orange Juice",
      description: "Freshly squeezed orange juice",
      price: new Prisma.Decimal(4.5),
      image: "/uploads/images/orange-juice.jpg",
      category: { connect: { id: categories["Beverages"] } },
    },
  ];

  const menuItems: Record<string, { id: number; price: Prisma.Decimal }> = {};
  for (const m of menuItemData) {
    const menuItem = await prisma.menuItem.create({ data: m });
    menuItems[menuItem.name] = { id: menuItem.id, price: menuItem.price };
  }

  console.log("Seeding product option categories & options...");

  const wingsSauce = await prisma.productOptionCategory.create({
    data: {
      name: "Sauce",
      isRequired: true,
      menuItem: { connect: { id: menuItems["Chicken Wings"].id } },
    },
  });
  const wingsSauceOptions = await Promise.all([
    prisma.productOption.create({
      data: {
        name: "Buffalo",
        additionalPrice: new Prisma.Decimal(0),
        productOptionCategory: { connect: { id: wingsSauce.id } },
      },
    }),
    prisma.productOption.create({
      data: {
        name: "BBQ",
        additionalPrice: new Prisma.Decimal(0),
        productOptionCategory: { connect: { id: wingsSauce.id } },
      },
    }),
    prisma.productOption.create({
      data: {
        name: "Honey Garlic",
        additionalPrice: new Prisma.Decimal(0.5),
        productOptionCategory: { connect: { id: wingsSauce.id } },
      },
    }),
  ]);

  const burgerAddOns = await prisma.productOptionCategory.create({
    data: {
      name: "Add-ons",
      isRequired: false,
      menuItem: { connect: { id: menuItems["Classic Beef Burger"].id } },
    },
  });
  await Promise.all([
    prisma.productOption.create({
      data: {
        name: "Extra Cheese",
        additionalPrice: new Prisma.Decimal(1.0),
        productOptionCategory: { connect: { id: burgerAddOns.id } },
      },
    }),
    prisma.productOption.create({
      data: {
        name: "Bacon",
        additionalPrice: new Prisma.Decimal(1.5),
        productOptionCategory: { connect: { id: burgerAddOns.id } },
      },
    }),
  ]);

  const pizzaSize = await prisma.productOptionCategory.create({
    data: {
      name: "Size",
      isRequired: true,
      menuItem: { connect: { id: menuItems["Margherita Pizza"].id } },
    },
  });
  const pizzaSizeOptions = await Promise.all([
    prisma.productOption.create({
      data: {
        name: 'Small (9")',
        additionalPrice: new Prisma.Decimal(0),
        productOptionCategory: { connect: { id: pizzaSize.id } },
      },
    }),
    prisma.productOption.create({
      data: {
        name: 'Medium (12")',
        additionalPrice: new Prisma.Decimal(3.0),
        productOptionCategory: { connect: { id: pizzaSize.id } },
      },
    }),
    prisma.productOption.create({
      data: {
        name: 'Large (16")',
        additionalPrice: new Prisma.Decimal(6.0),
        productOptionCategory: { connect: { id: pizzaSize.id } },
      },
    }),
  ]);

  console.log("Seeding restaurant tables...");
  const tables = [];
  for (const t of restaurantTableData) {
    tables.push(await prisma.restaurantTable.create({ data: t }));
  }

  console.log("Seeding orders & order items...");

  await prisma.order.create({
    data: {
      table: { connect: { id: tables[0].id } },
      totalPrice: new Prisma.Decimal(27.98),
      orderItems: {
        create: [
          {
            menuItem: { connect: { id: menuItems["Chicken Wings"].id } },
            productOption: { connect: { id: wingsSauceOptions[0].id } },
            quantity: 1,
            price: menuItems["Chicken Wings"].price,
            note: "Extra spicy please",
          },
          {
            menuItem: { connect: { id: menuItems["Classic Beef Burger"].id } },
            quantity: 1,
            price: menuItems["Classic Beef Burger"].price,
          },
          {
            menuItem: { connect: { id: menuItems["Iced Tea"].id } },
            quantity: 2,
            price: menuItems["Iced Tea"].price,
          },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      table: { connect: { id: tables[2].id } },
      totalPrice: new Prisma.Decimal(34.5),
      orderItems: {
        create: [
          {
            menuItem: { connect: { id: menuItems["Margherita Pizza"].id } },
            productOption: { connect: { id: pizzaSizeOptions[1].id } },
            quantity: 1,
            price: new Prisma.Decimal(17.0),
          },
          {
            menuItem: { connect: { id: menuItems["Spring Rolls"].id } },
            quantity: 2,
            price: menuItems["Spring Rolls"].price,
          },
          {
            menuItem: { connect: { id: menuItems["Chocolate Lava Cake"].id } },
            quantity: 1,
            price: menuItems["Chocolate Lava Cake"].price,
            note: "No nuts, allergy",
          },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      table: { connect: { id: tables[4].id } },
      totalPrice: new Prisma.Decimal(24.49),
      orderItems: {
        create: [
          {
            menuItem: { connect: { id: menuItems["Grilled Salmon"].id } },
            quantity: 1,
            price: menuItems["Grilled Salmon"].price,
          },
          {
            menuItem: { connect: { id: menuItems["Fresh Orange Juice"].id } },
            quantity: 1,
            price: menuItems["Fresh Orange Juice"].price,
          },
          {
            menuItem: { connect: { id: menuItems["New York Cheesecake"].id } },
            quantity: 1,
            price: menuItems["New York Cheesecake"].price,
          },
        ],
      },
    },
  });

  console.log("Seeding finished");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
