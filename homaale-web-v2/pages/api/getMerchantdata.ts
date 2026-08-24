import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    fs.readdir("merchantdata", (err, files) => {
        if (err) {
            console.error("Error reading the directory:", err.message);
            return res.status(500).json({ error: "Failed to read the directory" });
        }

        console.log("Files in directory:", files);

        // Optional: Filter for JSON files
        const jsonFiles = files.filter((file) => file.endsWith(".json"));

        res.status(200).json(jsonFiles);
    });
}
