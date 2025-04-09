import { Vehicle } from "@/models/Vehicle";
import mongoose from "mongoose";

const motorcycleSchema = new mongoose.Schema({});
motorcycleSchema.virtual("spotsNeeded").get(function () {
    return 1;
});

motorcycleSchema.methods.canFitInSpot = function (spot) {
    return true;    // Motorcycles can fit in any spot
};

export const Motorcycle = mongoose.models.Motorcycle || Vehicle.discriminator("Motorcycle", motorcycleSchema);
