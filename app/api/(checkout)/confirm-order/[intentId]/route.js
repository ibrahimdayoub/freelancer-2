import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

// Update Order
export const PUT = async ({ params }) => {
  try {
    const { intentId } = params;
    // Conect database
    await prisma.order.update({
      where: { intent_id: intentId },
      data: { status: "Paid and unshipped" },
    })
    return NextResponse.json({ message: "Order updated successfully" }, { status: 200 })
  } catch (error) {
    console.log("Error: " + error.message)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}