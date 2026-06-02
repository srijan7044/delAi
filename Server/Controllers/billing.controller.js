import { stripe } from "../Configs/stripe.js";
import Billing from "../Models/billing.model.js";
import User from "../Models/user.model.js";

export const createOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.userId;
    let amount = 0;

    if (plan === "pro") {
      amount = 399;
    }

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan",
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "delAi Pro Plan",
              description: "3 Months Access",
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/billing?canceled=true`,
      metadata: {
        userId: String(userId),
        plan,
      },
    });

    await Billing.create({
      userId,
      amount,
      plan,
      orderId: session.id,
    });

    return res.json({
      success: true,
      session,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Order creation failed",
    });
  }
};

export const verifyBilling = async (req, res) => {
  try {
    const { session_id } = req.body;

    const userId = req.userId;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: "Session id is required",
      });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.json({
        success: false,
        message: "Payment verification failed",
      });
    }

    await Billing.findOneAndUpdate(
      { orderId: session.id },
      {
        paymentId: session.payment_intent?.toString(),
        status: "paid",
      },
    );

    const user = await User.findByIdAndUpdate(
      userId,
      {
        plan: "pro",

        proExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
      { new: true },
    );

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};
