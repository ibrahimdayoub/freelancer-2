import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { checkSchema, zodString, zodNumber, zodBoolean } from "@/utils/helper";

const prisma = new PrismaClient()

// Get Products
export const GET = async (req) => {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    // Conect database
    const products = await prisma.product.findMany({
      where: {
        ...(category ? { catSlug: category } : { isFeatured: true }),
      },
      include: { category: true }
    })
    if (products.length === 0) {
      return NextResponse.json({ message: "Products not found" }, { status: 404 })
    }
    return NextResponse.json({ products, message: "Products fetched successfully" }, { status: 200 })
  } catch (error) {
    console.log("Error: " + error.message)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// Add Product
export const POST = async (req) => {
  try {
    const body = await req.json()
    // Validation
    const schemaStructure = z.object({
      title: z.string(zodString("title")),
      desc: z.string(zodString("desc")),
      img: z.optional(z.string(zodString("img"))),
      price: z.number(zodNumber("price")),
      isFeatured: z.optional(z.boolean(zodBoolean("is featured"))),
      options: z.array(z.object({
        optionTitle: z.string(zodString("option title")),
        additionalPrice: z.number(zodNumber("additional price")),
      })),
      catSlug: z.string(zodString("cat slug")),
    })
    const schemaObject = {
      title: body.title,
      desc: body.desc,
      img: body.img,
      price: body.price,
      isFeatured: body.isFeatured,
      options: body.options,
      catSlug: body.catSlug,
    }
    const validation = checkSchema(schemaStructure, schemaObject)
    if (validation) {
      return NextResponse.json({ validation, message: "Some fields are required or not validated" }, { status: 400 })
    }
    // Conect database
    const existProduct = await prisma.product.findFirst({
      where: {
        title: schemaObject.title,
        catSlug: schemaObject.catSlug
      }
    })
    if (existProduct) {
      return NextResponse.json({ message: "Product existed before" }, { status: 400 })
    }
    const product = await prisma.product.create({ data: schemaObject })
    return NextResponse.json({ product, message: "Product created successfully" }, { status: 201 })
  } catch (error) {
    console.log("Error: " + error.message)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}