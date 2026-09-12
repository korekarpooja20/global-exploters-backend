const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {

    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Preflight request
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // Only POST allowed
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Method not allowed"
        });
    }

    try {

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

        // Required fields
        if (!name || !email || !product) {
            return res.status(400).json({
                success: false,
                message: "Name, email and product are required."
            });
        }

        // Send email
        await resend.emails.send({
            from: "Global Exporters <onboarding@resend.dev>",
            to: [process.env.ENQUIRY_EMAIL],
            subject: `New Export Enquiry - ${product}`,

            html: `
                <h2>New Global Exporters Enquiry</h2>

                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Company:</strong> ${company || "N/A"}</p>
                <p><strong>Country:</strong> ${country || "N/A"}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || "N/A"}</p>
                <p><strong>Product:</strong> ${product}</p>
                <p><strong>Quantity:</strong> ${quantity || "N/A"}</p>
                <p><strong>Message:</strong> ${message || "N/A"}</p>
            `
        });

        return res.status(200).json({
            success: true,
            message: "Enquiry submitted successfully!"
        });

    } catch (error) {

        console.error("Email error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to send enquiry."
        });
    }
};
