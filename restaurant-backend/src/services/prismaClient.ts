import { prisma as basePrisma } from "../lib/prisma";

export const prisma = basePrisma.$extends({
  result: {
    menuItem: {
      image: {
        needs: {
          image: true,
        },
        compute(menuItem) {
          return "/optimize/" + menuItem.image.split(".")[0] + ".webp";
        },
      },
      updatedAt: {
        needs: { updatedAt: true },
        compute(menuItem) {
          return menuItem?.updatedAt.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        },
      },
      createdAt: {
        needs: { createdAt: true },
        compute(menuItem) {
          return menuItem?.createdAt.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        },
      },
    },

    order: {
      createdAt: {
        needs: { createdAt: true },
        compute(menuItem) {
          return menuItem?.createdAt.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        },
      },
    },

    image: {
      path: {
        needs: {
          path: true,
        },
        compute(image) {
          return "/optimize/" + image.path.split(".")[0] + ".webp";
        },
      },
    },
  },
});
