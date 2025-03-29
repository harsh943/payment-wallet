const express = require("express");
const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();
const app = express();

app.use(express.json())

app.post("/hdfcWebhook", async (req, res) => {
    //TODO: Add zod validation here
    //TODO: HDFC bank should ideally send us a secret so we know this is sent by them
    const paymentInformation = {
        token: req.body.token,
        userId: req.body.user_identifier,
        amount: req.body.amount
    };

    try {
        if (!paymentInformation.token || !paymentInformation.userId || !paymentInformation.amount) {
            return res.status(400).json({
                message: "Missing required fields in the webhook payload"
            });
        }
        const userId = parseInt(paymentInformation.userId, 10);
        const amount = parseFloat(paymentInformation.amount);

        if (isNaN(userId) || isNaN(amount)) {
            return res.status(400).json({
                message: "Invalid userId or amount in the webhook payload"
            });
        }

        await db.$transaction([
            db.balance.update({
                where: {
                    userId: userId
                },
                data: {
                    amount: {
                        increment: amount
                    }
                }
            }),
            db.onRampTransaction.update({
                where: {
                    token: paymentInformation.token
                }, 
                data: {
                    status: "Success",
                }
            })
        ]);

        res.json({
            message: "Captured"
        })
    } catch(e) {
        console.error("Webhook processing error:", e);
        
        // Set transaction status to Failure when an error occurs
        try {
            if (paymentInformation && paymentInformation.token) {
                await db.onRampTransaction.update({
                    where: {
                        token: paymentInformation.token
                    },
                    data: {
                        status: "Failure"
                    }
                });
            }
        } catch (updateError) {
            console.error("Failed to update transaction status:", updateError);
        }
        
        res.status(500).json({
            message: "Error while processing webhook"
        })
    }

})

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`Bank webhook server running on port ${PORT}`);
});