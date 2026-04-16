const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Debug API key
if (!process.env.API_KEY) {
    console.log("❌ API KEY NOT FOUND - Add it in Render Environment Variables");
}

// 🔥 TEMPLATE ENGINE FUNCTION
function buildMessage(template, data) {
    let finalMessage = template;

    Object.keys(data).forEach((key) => {
        const regex = new RegExp(`{{${key}}}`, "g");
        finalMessage = finalMessage.replace(regex, data[key] || "");
    });

    return finalMessage;
}

// 📩 SEND SMS API
app.post("/send-sms", async (req, res) => {
    try {
        const {
            number,
            template,
            name,
            brand,
            complaint,
            date,
            time,
            location
        } = req.body;

        if (!number || !template) {
            return res.status(400).json({
                message: "❌ Missing number or template"
            });
        }

        if (!process.env.API_KEY) {
            return res.status(500).json({
                message: "❌ API key not configured"
            });
        }

        // 🔥 Build final SMS message from template
        const message = buildMessage(template, {
            name,
            brand,
            complaint,
            date,
            time,
            location
        });

        // Send SMS via Fast2SMS
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

        console.log("SMS SENT:", response.data);

        res.json({
            message: "✅ SMS Sent Successfully",
            sentMessage: message
        });

    } catch (error) {
        console.log("FULL ERROR:", error.response?.data || error.message);

        res.status(500).json({
            message: "❌ Failed to send SMS"
        });
    }
});

// Health check
app.get("/", (req, res) => {
    res.send("✅ SMS Server is running");
});

// Port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
