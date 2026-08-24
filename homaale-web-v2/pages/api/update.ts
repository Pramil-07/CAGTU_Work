import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";

// Path to the JSON file
const filePath = path.join(process.cwd(), "data", "merchantdata.json");

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        try {
            // Get the updated profile data from the request body
            const updatedProfile = req.body;

            // Read the existing data
            const jsonData = fs.readFileSync(filePath, "utf-8");
            const data = JSON.parse(jsonData);

            // Update the specific profile
            data[1] = updatedProfile; // Adjust index or logic for specific profile

            // Write the updated data back to the file
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

            res.status(200).json({ message: "Profile updated successfully" });
        } catch (error) {
            console.error("Error updating profile:", error);
            res.status(500).json({ error: "Failed to update profile" });
        }
    } else {
        res.setHeader("Allow", ["POST"]);
        res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
}
