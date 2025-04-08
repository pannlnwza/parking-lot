import mongoose from "mongoose";
import { ParkingSpot } from "./ParkingSpot.js";
import { Level } from "./Level.js";
import { VehicleSizeEnum } from "./VehicleSize.js";

const vehicleSchema = new mongoose.Schema({
  licensePlate: { type: String, required: true, unique: true },
  size: { type: String, enum: Object.values(VehicleSizeEnum), required: true },
  spotsNeeded: { type: Number },
  parkedSpots: [{ type: mongoose.Schema.Types.ObjectId, ref: "ParkingSpot" }],
});

vehicleSchema.pre("save", async function (next) {
  if (this.size === "Bus") {
    this.spotsNeeded = 5;
  } else {
    this.spotsNeeded = 1;
  }

  next();
});

vehicleSchema.methods.parkInSpot = async function (spot) {
  this.parkedSpots.push(spot._id);
  spot.isOccupied = true;
  spot.vehicle = this._id;
  
  await spot.save();
  await this.save();

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
