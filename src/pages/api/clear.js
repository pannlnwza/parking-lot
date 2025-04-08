import Database from "../../../lib/db";
import { Vehicle } from "../../../models/Vehicle";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  await Database.getInstance().connect();

  try {
    const { licensePlate } = req.body;
    const vehicle = await Vehicle.findOne({ licensePlate });

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    await vehicle.clearSpots();
    res.status(200).json({ message: "Vehicle removed from parking", vehicle });
  } catch (error) {
    res.status(500).json({ error: "Error clearing parking spot" });
  }
}
