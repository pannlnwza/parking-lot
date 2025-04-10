import mongoose from "mongoose";
import { ParkingSpot } from "@/models/ParkingSpot.js";
import { Level } from "@/models/Level.js";
import { VehicleSizeEnum } from "@/models/VehicleSize.js";

const vehicleSchema = new mongoose.Schema({
  	licensePlate: { type: String, required: true, unique: true },
  	size: { type: String, enum: Object.values(VehicleSizeEnum), required: true },
  	parkedSpots: [{ type: mongoose.Schema.Types.ObjectId, ref: "ParkingSpot" }],}
	, { discriminatorKey: "size", collection: "vehicles" }
);

vehicleSchema.methods.parkInSpot = async function (spot) {
  	spot.isOccupied = true;
  	spot.vehicle = this._id;
  	await spot.save();

	const vehicle = await Vehicle.findById(this._id);
	vehicle.parkedSpots.push(spot._id);
	await vehicle.save();

  // Update available spots count in the Level
  	const level = await Level.findById(spot.level);
  	if (level) {
    	level.availableSpots -= 1;
    	await level.save();
  	}
};

vehicleSchema.methods.clearSpots = async function () {
  	const spots = await ParkingSpot.find({ _id: { $in: this.parkedSpots } });

  	for (const spot of spots) {
    	spot.removeVehicle();

    	const level = await Level.findById(spot.level);
    	if (level) {
      		level.availableSpots += 1;
      		await level.save();
    	}
  	}

  	this.parkedSpots = [];
  	await this.save();
};

vehicleSchema.methods.canFitInSpot = function (spot) {
  	return (
    	spot.size === this.size ||
    	(spot.size === "Car" && this.size === "Motorcycle") ||
    	(spot.size === "Motorcycle" && this.size === "Car")
  	);
};

export const Vehicle = mongoose.models.Vehicle || mongoose.model("Vehicle", vehicleSchema);
