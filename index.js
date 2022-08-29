const express = require("express");
const axios = require("axios").default;
const cors = require("cors");
const { convert } = require("subtitle-converter");

const app = express();

app.use(cors({ origin: true }));

app.get("/", async (req, res) => {
    try {
        const url = req.query.url;

        if (!url || typeof url !== "string")
            return res.status(400).send("Invalid request");

        const response = await axios.get(encodeURI(url));

        if (
            !response.headers["content-type"].startsWith(
                "application/x-subrip"
            ) &&
            !response.headers["content-type"].startsWith("srt")
        )
            return res.status(400).send("Invalid content type");

        const { subtitle } = convert(response.data, ".vtt");

        if (!subtitle) return res.status(400).send("Cannot convert");

        res.setHeader("content-type", "text/vtt");

        res.send(subtitle);
    } catch (error) {
        console.log(error);
        if (!res.headerSent)
            res.status(500).send("Failed to convert the subtitle");
    }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server is listening on port ${port}`));
