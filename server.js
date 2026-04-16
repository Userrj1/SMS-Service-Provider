const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(__dirname));

// Debug check (important for Render)
if (!process.env.API_KEY) {
    console.log("❌ API KEY NOT FOUND - Add it in Render Environment Variables");
}

// Send SMS API
app.post("/send-sms", async (req, res) => {
    try {
        const { number, message } = req.body;

        if (!number || !message) {
            return res.status(400).json({
                message: "❌ Missing number or message"
            });
        }

        if (!process.env.API_KEY) {
            return res.status(500).json({
                message: "❌ API key not configured"
            });
        }

        const response = await axios.post(
            "https://www.fast2sms.com/dev/bulkV2",
            {
                route: "q",
                message: message,
                language: "english",
                numbers: number,
                flash: 0
            },
            {
                headers: {
                    authorization: process.env.API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("SMS API RESPONSE:", response.data);

        res.json({
            message: "✅ SMS Sent Successfully"
        });

    } catch (error) {
        console.log("FULL ERROR:", error.response?.data || error.message);

        res.status(500).json({
            message: "❌ Failed to send SMS"
        });
    }
});

// Health check route (VERY IMPORTANT for Render)
app.get("/", (req, res) => {
    res.send("✅ SMS Server is running");
});

// Dynamic port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});