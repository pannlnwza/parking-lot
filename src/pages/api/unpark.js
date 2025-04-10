import { Vehicle } from "@/models/Vehicle";

export default async function handler(req, res) {
    if (req.method === "POST") {
        const { id } = req.body;
        try {
            const vehicle = await Vehicle.findById(id);
            if (!vehicle) {
                return res.status(404).json({ message: "Vehicle not found" });
            }
            await vehicle.clearSpots();
            await vehicle.save(); 
            res.status(200).json({ message: "Vehicle unparked successfully" });
        } catch (error) {
            res.status(500).json({ message: error.message || "An error occurred while unparking the vehicle" });
        }
    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}