import { ParkingSpot } from "@/models/ParkingSpot";

export async function unparkVehicle(vehicleId) {
    const spots = await ParkingSpot.find({ vehicle: vehicleId });

    for (const spot of spots) {
        spot.removeVehicle();
    }
}