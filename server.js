require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");
const { createClient } = require("@supabase/supabase-js");

const app = express();

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
);

app.use(cors());
app.use(express.json());


// =========================================
// HOME / TEST
// =========================================

app.get("/", (req, res) => {
    res.send("Global Exporters Backend is Working!");
});


// =========================================
// CUSTOMER ENQUIRY
// =========================================

app.post("/api/enquiry", async (req, res) => {

    try {

        console.log("Enquiry received:", req.body);

        const {
            name,
            company,
            country,
            email,
            phone,
            product,
            quantity,
            message
        } = req.body;


        // Save enquiry to Supabase
        const { data, error } = await supabase
            .from("enquiries")
            .insert([
                {
                    name: name,
                    company: company,
                    country: country,
                    email: email,
                    phone: phone,
                    product: product,
                    quantity: quantity,
                    message: message,
                    status: "New"
                }
            ])
            .select();


        if (error) {

            console.error("Supabase Error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to save enquiry"
            });

        }


        console.log("Enquiry saved to Supabase:", data);


        // Send email notification
        const emailResult = await resend.emails.send({

            from: "Global Exporters <onboarding@resend.dev>",

            to: ["korekarpooja20@gmail.com"],

            subject: `New Enquiry - ${product || "Product"}`,

            html: `
                <h2>New Global Exporters Enquiry</h2>

                <p><strong>Name:</strong> ${name || ""}</p>

                <p><strong>Company:</strong> ${company || ""}</p>

                <p><strong>Country:</strong> ${country || ""}</p>

                <p><strong>Email:</strong> ${email || ""}</p>

                <p><strong>Phone:</strong> ${phone || ""}</p>

                <p><strong>Product:</strong> ${product || ""}</p>

                <p><strong>Quantity:</strong> ${quantity || ""}</p>

                <p><strong>Message:</strong> ${message || ""}</p>
            `
        });


        console.log("Resend result:", emailResult);


        res.json({

            success: true,

            message: "Enquiry submitted successfully!"

        });


    } catch (error) {

        console.error("Enquiry error:", error);

        res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

});


// =========================================
// ADMIN - GET ALL ENQUIRIES
// =========================================

app.get("/api/admin/enquiries", async (req, res) => {

    try {

        console.log("Loading enquiries from Supabase...");


        const { data, error } = await supabase
            .from("enquiries")
            .select("*")
            .order("created_at", {
                ascending: false
            });


        if (error) {

            console.error("Supabase Admin Error:", error);

            return res.status(500).json({

                success: false,

                message: error.message

            });

        }


        console.log("Enquiries found:", data);


        return res.json({

            success: true,

            enquiries: data

        });


    } catch (error) {

        console.error("Admin API Error:", error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

});


// =========================================
// LOCAL SERVER
// =========================================

if (require.main === module) {

    app.listen(5000, () => {

        console.log(
            "Server running at http://localhost:5000"
        );

    });

}


module.exports = app;
