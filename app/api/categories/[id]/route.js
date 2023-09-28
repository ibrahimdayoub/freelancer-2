import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { checkSchema, zodString } from "@/utils/helper";

const prisma = new PrismaClient()

// Get Category
export const GET = async (req, { params }) => {
    try {
        const { id } = params
        // Conect database
        const category = await prisma.category.findUnique({
            where: { id },
            include: { products: true }
        })
        if (!category) {
            return NextResponse.json({ message: "Category not found" }, { status: 404 })
        }
        return NextResponse.json({ category, message: "Category fetched successfully" }, { status: 200 })
    } catch (error) {
        console.log("Error: " + error.message)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

// Update Category
export const PUT = async (req, { params }) => {
    try {
        const { id } = params
        const body = await req.json()
        // Validation
        const schemaStructure = z.object({
            title: z.optional(z.string(zodString("title"))),
            desc: z.optional(z.string(zodString("desc"))),
            color: z.optional(z.string(zodString("color"))),
            img: z.optional(z.string(zodString("img"))),
            slug: z.optional(z.string(zodString("slug"))),
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
        let existCategory = await prisma.product.findUnique({
            where: { id }
        })
        if (!existCategory) {
            return NextResponse.json({ message: "Category not found" }, { status: 404 })
        }
        const category = await prisma.category.update({
            where: { id },
            data: schemaObject,
        })
        return NextResponse.json({ category, message: "Category updated successfully" }, { status: 200 })
    } catch (error) {
        console.log("Error: " + error.message)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

// Delete Category
export const DELETE = async (req, { params }) => {
    try {
        const { id } = params
        // Conect database
        let category = await prisma.category.findUnique({
            where: { id }
        })
        if (!category) {
            return NextResponse.json({ message: "Category not found" }, { status: 404 })
        }
        await prisma.category.delete({
            where: { id }
        })
        return NextResponse.json({ category, message: "Category deleted successfully" }, { status: 200 })
    } catch (error) {
        console.log("Error: " + error.message)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
} 