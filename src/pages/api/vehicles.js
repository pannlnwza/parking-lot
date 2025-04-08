import { Vehicle } from "../../models/Vehicle";
import Database from "@/lib/mongodb";

export default async function handler(req, res) {
	await Database.getInstance().connect();

	if (req.method === "POST") {
		const { licensePlate, size } = req.body;

		if (!licensePlate || !size) {
		return res.status(400).json({ message: "License plate and size are required" });
		}

		try {
			const existingVehicle = await Vehicle.findOne({ licensePlate });
			if (existingVehicle) {
				return res.status(400).json({ message: "Vehicle with this license plate already exists" });
			}

			const newVehicle = new Vehicle({
				licensePlate,
				size,
			});
			await newVehicle.save();
			res.status(201).json(newVehicle);
		} catch (error) {
			res.status(500).json({ message: "Error creating vehicle" });
		}

	} else if (req.method === "GET") {
		try {
		const vehicles = await Vehicle.find().populate("parkedSpots");
		res.status(200).json(vehicles);
		} catch (error) {
		res.status(500).json({ message: "Error fetching vehicles" });
		}
	} else if (req.method === "DELETE") {
		const { id } = req.body;
		console.log("Deleting vehicle with ID:", id);
		try {
			await Vehicle.findByIdAndDelete(id);
			res.status(200).json({ message: "Vehicle deleted" });
		} catch (error) {
			res.status(500).json({ message: "Error deleting vehicle" });
		}	
	} else {
		res.status(405).json({ message: "Method not allowed" });
	}
}
