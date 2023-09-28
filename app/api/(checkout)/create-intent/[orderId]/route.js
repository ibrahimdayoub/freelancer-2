import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

// Add Intent & Update Order
export async function POST(request, { params }) {
  try {
    const { orderId } = params
    // Conect database
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.price * 100,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      }
    })
    await prisma.order.update({
      where: { id: orderId },
      data: { intent_id: paymentIntent.id }
    })
    return NextResponse.json({ clientSecret: paymentIntent.client_secret, message: "Intent created successfully" }, { status: 200 })
  } catch (error) {
    console.log("Error: " + error.message)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}