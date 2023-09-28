import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { checkSchema, zodString, zodNumber, zodBoolean } from "@/utils/helper";

const prisma = new PrismaClient()

// Get Product
export const GET = async (req, { params }) => {
  try {
    const { id } = params
    // Conect database
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true }
    })
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }
    return NextResponse.json({ product, message: "Product fetched successfully" }, { status: 200 })
  } catch (error) {
    console.log("Error: " + error.message)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// Update Product
export const PUT = async (req, { params }) => {
  try {
    const { id } = params
    const body = await req.json()
    // Validation
    const schemaStructure = z.object({
      title: z.optional(z.string(zodString("title"))),
      desc: z.optional(z.string(zodString("desc"))),
      img: z.optional(z.string(zodString("img"))),
      price: z.optional(z.number(zodNumber("price"))),
      isFeatured: z.optional(z.boolean(zodBoolean("is featured"))),
      options: z.optional(z.array(z.object({
        optionTitle: z.string(zodString("option title")),
        additionalPrice: z.number(zodNumber("additional price")),
      }))),
      catSlug: z.optional(z.string(zodString("slug"))),
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
    let existProduct = await prisma.product.findUnique({
      where: { id }
    })
    if (!existProduct) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }
    const product = await prisma.product.update({
      where: { id },
      data: schemaObject,
    })
    return NextResponse.json({ product, message: "Product updated successfully" }, { status: 200 })
  } catch (error) {
    console.log("Error: " + error.message)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// Delete Product
export const DELETE = async (req, { params }) => {
  try {
    const { id } = params
    // Conect database
    let product = await prisma.product.findUnique({
      where: { id }
    })
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }
    await prisma.product.delete({
      where: { id }
    })
    return NextResponse.json({ product, message: "Product deleted successfully" }, { status: 200 })
  } catch (error) {
    console.log("Error: " + error.message)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}