import { Vehicle } from "../../models/Vehicle";
import { Motorcycle } from "@/models/Motorcycle";
import { Car } from "@/models/Car";
import { Bus } from "@/models/Bus";
import { VehicleSizeEnum } from "@/models/VehicleSize";
import Database from "@/lib/Database";

const VehicleModelEnum = {
	[VehicleSizeEnum.MOTORCYCLE]: Motorcycle,
	[VehicleSizeEnum.CAR]: Car,
	[VehicleSizeEnum.BUS]: Bus,
};

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
			
			const Model = VehicleModelEnum[size];
			if (!Model) {
				return res.status(400).json({ message: "Invalid vehicle size" });
			}
			const newVehicle = await Model.create({ licensePlate, size });
			await newVehicle.save();
			res.status(201).json(newVehicle);
		} catch (error) {
			res.status(500).json({ message: "Error creating vehicle" });
		}

	} else if (req.method === "GET") {
		try {
			const vehicles = await Vehicle.find().populate({path: "parkedSpots", populate: { path: "level" }});
			res.status(200).json(vehicles);
		} catch (error) {
			res.status(500).json({ message: "Error fetching vehicles" });
		}
	} else if (req.method === "DELETE") {
		const { id } = req.body;
		console.log("Deleting vehicle with ID:", id);
		try {
			const vehicle = await Vehicle.findById(id);
			if (!vehicle) {
				return res.status(404).json({ message: "Vehicle not found" });
			}
			await vehicle.clearSpots();
			await vehicle.save();
			await Vehicle.deleteOne({ _id: id });
			res.status(200).json({ message: "Vehicle deleted" });
		} catch (error) {
			res.status(500).json({ message: "Error deleting vehicle" });
		}	
	} else {
		res.status(405).json({ message: "Method not allowed" });
	}
}
