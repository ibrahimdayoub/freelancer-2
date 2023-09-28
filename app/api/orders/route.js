import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getAuthSession } from "@/utils/auth";

const prisma = new PrismaClient()

// Get Orders
export const GET = async (req) => {
  // const session = await getAuthSession();
  // if (session) {
  try {
    let orders = []
    // if (session.user.isAdmin) {
      orders = await prisma.order.findMany({
        include: { user: true }
      });
    // }
    // else {
    //   orders = await prisma.order.findMany({
    //     where: { userEmail: session.user.email },
    //     include: { user: true }
    //   })
    // }
    if (orders.length === 0) {
      return NextResponse.json({ message: "Orders not found" }, { status: 404 })
    }
    return NextResponse.json({ orders, message: "Orders fetched successfully" }, { status: 200 })
  } catch (error) {
    console.log("Error: " + error.message)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
  // } else {
  //   return NextResponse.json({ message: "You are not authenticated" }, { status: 401 })
  // }
}

// Add Order
export const POST = async (req) => {
  // const session = await getAuthSession();
  // if (session) {
  try {
    const body = await req.json();
    // Validation
    const schemaStructure = z.object({
      price: z.number(zodNumber("price")),
      products: z.array(z.object({
        x: z.string(zodString("y")),
        y: z.number(zodNumber("y")),
      })),
      status: z.enum(["1", "2", "3"]),
      intentId: z.string(zodString("intent id")),
      userEmail: z.string(zodString("user email")),
    })
    const schemaObject = {
      price: body.price,
      products: body.products,
      status: body.status,
      intentId: body.intentId,
      userEmail: body.userEmail
    }
    const validation = checkSchema(schemaStructure, schemaObject)
    if (validation) {
      return NextResponse.json({ validation, message: "Some fields are required or not validated" }, { status: 400 })
    }
    // Conect database
    const existOrder = await prisma.order.findFirst({
      where: {
        intentId: schemaObject.intentId,
      }
    })
    if (existOrder) {
      return NextResponse.json({ message: "Order existed before" }, { status: 400 })
    }
    const order = await prisma.order.create({ data: schemaObject })
    return NextResponse.json({ order, message: "Order created successfully" }, { status: 201 })
  } catch (error) {
    console.log("Error: " + error.message)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
  // } else {
  //   return NextResponse.json({ message: "You are not authenticated" }, { status: 401 })
  // }
}