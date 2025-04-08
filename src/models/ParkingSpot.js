import mongoose from 'mongoose';

const parkingSpotSchema = new mongoose.Schema({
	level: { type: mongoose.Schema.Types.ObjectId, ref: 'Level', required: true },
	row: { type: Number, required: true },
	spotNumber: { type: Number, required: true },
	size: { type: String, enum: ['Motorcycle', 'Car', 'Bus'], required: true },
	isOccupied: { type: Boolean, default: false },
	vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', default: null },
});

parkingSpotSchema.methods.canFitVehicle = function (vehicle) {
	return this.isOccupied === false && vehicle.canFitInSpot(this);
}

parkingSpotSchema.methods.park = async function (vehicle) {
	if (this.canFitVehicle(vehicle)) {
		this.isOccupied = true;
		this.vehicle = vehicle._id;
		await this.save();
		vehicle.parkInSpot(this);
		await vehicle.save();
		return true;
	}
	return false;
}

parkingSpotSchema.methods.removeVehicle = async function () {
	this.isOccupied = false;
	this.vehicle = null;
	await this.save();
}

export const ParkingSpot = mongoose.models.ParkingSpot || mongoose.model('ParkingSpot', parkingSpotSchema);