// import { prisma } from "../lib/prisma";

// export type ProductOptionArgs = {
//   name: string;
//   additionalPrice: number;
//   productOptionCategory: string;
// };

// export const createOneProductOption = async (productOptionData: ProductOptionArgs) => {
//   const data: any = {
//     name: productOptionData.name,
//     additionalPrice: productOptionData.additionalPrice,
//     productOptionCategory: {
//       connect: {
//         name: productOptionData.menuItem,
//       },
//     },
//   };

//   return prisma.productOption.create({
//     data: productOptionData,
//   });
// };

// export const getProductOptionByName = async (name: string) => {
//   return prisma.productOption.findUnique({
//     where: { name },
//   });
// };

// export const getProductOptionById = async (id: number) => {
//   return prisma.productOption.findUnique({
//     where: { id },
//   });
// };

// export const updateOneProductOption = async (
//   id: number,
//   Data: ProductOptionArgs,
// ) => {
//   const data: any = {
//     name: Data.name,
//     isRequired: Data.isRequired,
//     menuItem: {
//       connect: {
//         name: Data.menuItem,
//       },
//     },
//   };
//   return prisma.productOption.update({
//     where: { id },
//     data,
//   });
// };

// export const deleteOneProductOption = async (id: number) => {
//   return prisma.productOption.delete({
//     where: { id },
//   });
// };

// export const getOneProductOption = async (id: number) => {
//   return prisma.productOption.findUnique({
//     where: { id },
//   });
// };

// export const getProductOptionCategoriesList = async () => {
//   return prisma.productOption.findMany();
// };
