import Database from "@/lib/Database";
import { Level } from "@/models/Level";
import { Vehicle } from "@/models/Vehicle";
import { ParkingLot } from "@/models/ParkingLot";

export default async function handler(req, res) {
	await Database.getInstance().connect();

	if (req.method == "POST") {
		const { licensePlate, levelId }  = req.body;

		if (!licensePlate) {
			return res.status(400).json({ message: "License plate is required." });
		}

		try {
			const vehicle = await Vehicle.findOne({ licensePlate });
			if (!vehicle) {
				return res.status(404).json({ message: "Vehicle not found." });
			}

			await vehicle.clearSpots();
			let success = false;

			if (levelId === "auto") {
				const lot = await ParkingLot.getInstance();
				success = await lot.parkVehicle(vehicle);
			} else if (levelId) {
				const level = await Level.findById(levelId);
				if (!level) {
					return res.status(404).json({ message: "Level not found." });
				}
				success = await level.parkVehicle(vehicle);
			}
			if (!success) {
				return res.status(400).json({ message: "No available spots." });
			} else {
				return res.status(200).json({ message: "Vehicle parked successfully." });
			}
			
		} catch (error) {
			console.error("Error parking vehicle:", error);
			return res.status(500).json({ message: "Error parking vehicle." });
		}
	} else {
		res.status(405).json({ message: "Method not allowed." });
	}
}