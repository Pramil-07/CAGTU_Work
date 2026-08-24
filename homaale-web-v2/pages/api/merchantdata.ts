import { NextApiRequest, NextApiResponse } from "next";
import {merchants} from "@/merchantdata/Merchant"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        res.status(200).json(merchants);
    } catch (error) {
        console.error("Error fetching merchant data:", error);
        res.status(500).json({ error: "Failed to fetch merchant data" });
    }
}
