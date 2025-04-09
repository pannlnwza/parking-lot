import { Vehicle } from "@/models/Vehicle";
import mongoose from "mongoose";

const busSchema = new mongoose.Schema({});
busSchema.virtual("spotsNeeded").get(function () {
    return 5;
});

busSchema.methods.canFitInSpot = function (spot) {
    return (spot.size === "Bus");
}

export const Bus = mongoose.models.Bus || Vehicle.discriminator("Bus", busSchema);