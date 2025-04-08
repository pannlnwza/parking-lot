import Database from "@/lib/mongodb";
import { Level } from "@/models/Level";
import { Vehicle } from "@/models/Vehicle";
import { ParkingSpot } from "@/models/ParkingSpot";

export default async function handler(req, res) {
	await Database.getInstance().connect();

	if (req.method === "POST") {
		const { licensePlate, levelId } = req.body;

		if (!licensePlate || !levelId) {
		return res.status(400).json({ message: "License plate and levelId are required" });
		}

		try {
			const vehicle = await Vehicle.findOne({ licensePlate });
			if (!vehicle) {
				return res.status(404).json({ message: "Vehicle not found" });
			}
			const level = await Level.findById(levelId);
			if (!level) {
				return res.status(404).json({ message: "Level not found" });
			}

			// Try to park the vehicle at the selected level
			const success = await level.parkVehicle(vehicle);
			if (success) {
				return res.status(200).json({ message: "Vehicle parked successfully" });
			} else {
				return res.status(400).json({ message: "Not enough available spots for this vehicle" });
			}
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Error parking vehicle" });
		}
	} else {
		res.status(405).json({ message: "Method not allowed" });
	}
}