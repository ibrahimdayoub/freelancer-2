import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getAuthSession } from "@/utils/auth";

const prisma = new PrismaClient()

// Update Order
export const PUT = async (req, { params }) => {
  // const session = await getAuthSession();
  // if (session && session.user.isAdmin) {
  try {
    const { id } = params
    const body = await req.json()
    // Validation
    const schemaStructure = z.object({
      status: z.enum(["Paid and unshipped", "Paid and shipped"]),
    })
    const schemaObject = {
      status: body.status,
    }
    const validation = checkSchema(schemaStructure, schemaObject)
    if (validation) {
      return NextResponse.json({ validation, message: "Some fields are required or not validated" }, { status: 400 })
    }
    // Conect database
    let existOrder = await prisma.order.findUnique({
      where: { id }
    })
    if (!existOrder) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }
    const order = await prisma.order.update({
      where: { id },
      data: schemaObject,
    })
    return NextResponse.json({ order, message: "Order updated successfully" }, { status: 200 })
  } catch (error) {
    console.log("Error: " + error.message)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
  // } else {
  //   return NextResponse.json({ message: "You are not authenticated" }, { status: 401 })
  // }
}