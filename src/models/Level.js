import mongoose from 'mongoose';
import { ParkingSpot } from './ParkingSpot';
import { VehicleSizeEnum } from './VehicleSize';
import { ParkingLot } from '@/models/ParkingLot';

const SPOTS_PER_ROW = 10;

const levelSchema = new mongoose.Schema({
	floor: { type: Number, required: true, unique: true },
	spots: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSpot' }],
	availableSpots: { type: Number, default: 0 },
});

levelSchema.methods.initializeSpots = async function (numberSpots) {
	const lot = await ParkingLot.getInstance();
	const largeSpots = Math.floor(numberSpots / 4);
	const motorcycleSpots = Math.floor(numberSpots / 4);
	const compactSpots = numberSpots - largeSpots - motorcycleSpots;

	const spotIds = [];
	for (let i = 0; i < numberSpots; i++) {
		let size = VehicleSizeEnum.MOTORCYCLE;
	
		if (i < largeSpots) {
			size = VehicleSizeEnum.BUS;
		} else if (i < largeSpots + compactSpots) {
			size = VehicleSizeEnum.CAR;
		}

		const row = Math.floor(i / SPOTS_PER_ROW);
		const spot = await ParkingSpot.create({
			level: this._id,
			row,
			spotNumber: i,
			size,
			isOccupied: false,
		});

		spotIds.push(spot._id);
	}

	this.spots = spotIds;
	this.availableSpots = numberSpots;
	await this.save();
	lot.levels.push(this._id);
	lot.totalLevels = lot.levels.length;
	await lot.save();
};

levelSchema.methods.getAvailableSpots = function () {
  	return this.availableSpots;
};

levelSchema.methods.parkVehicle = async function (vehicle) {
	if (this.availableSpots < vehicle.spotsNeeded) {
		return false;
  	}

	const spotNumber = await this.findAvailableSpots(vehicle);
	if (spotNumber < 0) {
		return false;
	}
	return await this.parkStartingAtSpot(spotNumber, vehicle);
};

levelSchema.methods.parkStartingAtSpot = async function (spotNumber, vehicle) {
	let success = true;

	vehicle.clearSpots();

	for (let i = spotNumber; i < spotNumber + vehicle.spotsNeeded; i++) {
		const spot = await ParkingSpot.findById(this.spots[i]);
		if (spot) {
			success &= await spot.park(vehicle);
		}
	}

	if (success) {
		this.availableSpots -= vehicle.spotsNeeded;
		await this.save();
	}
	return success;
};

levelSchema.methods.findAvailableSpots = async function (vehicle) {
	const spotsNeeded = vehicle.spotsNeeded;
	let spotsFound = 0;
	let lastRow = -1;

	// Iterate through all spots to find continuous available spots
	for (let i = 0; i < this.spots.length; i++) {
		const spot = await ParkingSpot.findById(this.spots[i]);

		if (lastRow !== spot.row) {
			spotsFound = 0;
			lastRow = spot.row;
		}

		if (spot.canFitVehicle(vehicle)) {
			spotsFound++;
		} else {
			spotsFound = 0;
		}

		if (spotsFound === spotsNeeded) {
			return i - (spotsNeeded - 1); // Return the index of the first available spot
		}
	}

	return -1; // No available spots
};

levelSchema.methods.spotFreed = async function () {
	this.availableSpots++;
	await this.save();
};

export const Level = mongoose.models.Level || mongoose.model('Level', levelSchema);
