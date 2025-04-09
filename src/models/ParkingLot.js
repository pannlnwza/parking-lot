import mongoose from "mongoose";
import { Level } from "./Level.js";

const parkingLotSchema = new mongoose.Schema({
    levels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Level" }],
    totalLevels: { type: Number, required: true },
});

parkingLotSchema.methods.parkVehicle = async function (vehicle) {
	for (const levelId of this.levels) {
     	const level = await Level.findById(levelId);
     	if (await level.parkVehicle(vehicle)) {
        		return true;
      	}
    	}
    	return false;
};

parkingLotSchema.statics.getInstance = async function () {
	let lot = await this.findOne();
	if (!lot) {
		lot = new this({ totalLevels: 0 });
		await lot.save();
	}
	return lot;
}

export const ParkingLot = mongoose.models.ParkingLot || mongoose.model("ParkingLot", parkingLotSchema);
