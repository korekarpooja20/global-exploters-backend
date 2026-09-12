require("dotenv").config();
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const { Resend } = require("resend");

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Global Exporters Backend is Working!");
});

app.post("/api/enquiry", (req, res) => {

    console.log("Enquiry received:", req.body);

    const file = "enquiry.json";

    let enquiries = [];

    if (fs.existsSync(file)) {
        const data = fs.readFileSync(file, "utf8");

        if (data.trim() !== "") {
            enquiries = JSON.parse(data);
        }
    }

    enquiries.push({
        id: Date.now(),
        name: req.body.name,
        company: req.body.company,
        country: req.body.country,
        email: req.body.email,
        phone: req.body.phone,
        product: req.body.product,
        quantity: req.body.quantity,
        message: req.body.message,
        date: new Date().toISOString()
    });

    fs.writeFileSync(
        file,
        JSON.stringify(enquiries, null, 2)
    );

    console.log("Enquiry saved successfully!");

    res.json({
        success: true,
        message: "Enquiry submitted successfully!"
    });
});
module.exports = app;