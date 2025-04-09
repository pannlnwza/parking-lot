import { Vehicle } from "@/models/Vehicle";
import mongoose from "mongoose";

const carSchema = new mongoose.Schema({});
carSchema.virtual("spotsNeeded").get(function () {
    return 1;
});

carSchema.methods.canFitInSpot = function (spot) {
    return (spot.size === "Car" || spot.size === "Bus");
};

export const Car = mongoose.models.Car || Vehicle.discriminator("Car", carSchema);