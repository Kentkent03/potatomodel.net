import express from "express";
import dotenv from "dotenv";
import stripe from "stripe";

//Load
dotenv.config()
//Start
const app = express()

app.use(express.static("public"));
app.use(express.json());

//Home
app.get("/", (req, res) => {
    res.sendFile("index.html", {root: "public"});
})
//Success
app.get("/success", (req, res) => {
    res.sendFile("success.html", {root: "public"});
})
//Fail
app.get("/fail", (req, res) => {
    res.sendFile("fail.html", {root: "public"});
})
//Stripe
let stripeGateway = stripe(process.env.stripe_api);
let DOMAIN = process.env.DOMAIN;
app.post("/stripe-checkout", async (req, res) => {
    const lineItems = req.body.items.map((item) => {
        const unitAmount = parseInt(item.price.replace(/[^0-9.-]+/g, "") * 100);
        console.log("item-price:", item.price);
        console.log("unitAmount:", unitAmount);
        return {
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.title,
                    images: [item.productImg]
                },
                unit_amount: unitAmount,
            },
            quantity: item.quantity,
        };
    });
    console.log("lineItems", lineItems);
    //Create
    const session = await stripeGateway.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        success_url: `${DOMAIN}/success`,
        cancel_url: `${DOMAIN}/fail`,
        line_items: lineItems,
        //AskAdress
        billing_address_collection: "required",
    });
    res.json(session.url);
});

app.listen(2902, () => {
    console.log("listening on port 2902;");
})