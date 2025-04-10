import { Level } from "@/models/Level";
import Database from "@/lib/Database";

export default async function handler(req, res) {
  	await Database.getInstance().connect();

  	if (req.method === "POST") {
    	const { floor, numberSpots } = req.body;

		if (floor === undefined || numberSpots === undefined) {
			return res.status(400).json({ message: "Floor and number of spots are required." });
		}

		try {
			const existingLevel = await Level.findOne({ floor });
			if (existingLevel) {
				return res.status(400).json({ message: "Level with this floor already exists." });
			}

			const level = new Level({ floor });
			await level.save();
			await level.initializeSpots(numberSpots);

			const populatedLevel = await Level.findById(level._id).populate("spots");

			res.status(201).json(populatedLevel);
		} catch (error) {
			console.error("Error creating level:", error);
			res.status(500).json({ message: "Failed to create level." });
		}
  	}

  	else if (req.method === "GET") {
		try {
		const levels = await Level.find().populate("spots");
		res.status(200).json(levels);
		} catch (error) {
		res.status(500).json({ message: "Failed to fetch levels." });
		}
  	}

  	else {
    	res.status(405).json({ message: "Method not allowed." });
  	}
}
