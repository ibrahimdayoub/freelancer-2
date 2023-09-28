import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { checkSchema, zodString } from "@/utils/helper";

const prisma = new PrismaClient()

// Get Categories
export const GET = async () => {
  try {
    // Conect database
    const categories = await prisma.category.findMany({
      include: { products: true }
    })
    if (categories.length === 0) {
      return NextResponse.json({ message: "Categories not found" }, { status: 404 })
    }
    return NextResponse.json({ categories, message: "Categories fetched successfully" }, { status: 200 })
  } catch (error) {
    console.log("Error: " + error.message)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// Add Category
export const POST = async (req) => {
  try {
    const body = await req.json()
    // Validation
    const schemaStructure = z.object({
      title: z.string(zodString("title")),
      desc: z.string(zodString("desc")),
      color: z.string(zodString("color")),
      img: z.optional(z.string(zodString("img"))),
      slug: z.string(zodString("slug")),
    })
    const schemaObject = {
      title: body.title,
      desc: body.desc,
      color: body.color,
      img: body.img,
      slug: body.slug,
    }
    const validation = checkSchema(schemaStructure, schemaObject)
    if (validation) {
      return NextResponse.json({ validation, message: "Some fields are required or not validated" }, { status: 400 })
    }
    // Conect database
    const existCategory = await prisma.category.findFirst({
      where: {
        slug: schemaObject.slug,
      }
    })
    if (existCategory) {
      return NextResponse.json({ message: "Category existed before" }, { status: 400 })
    }
    const category = await prisma.category.create({ data: schemaObject })
    return NextResponse.json({ category, message: "Category created successfully" }, { status: 201 })
  } catch (error) {
    console.log("Error: " + error.message)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}