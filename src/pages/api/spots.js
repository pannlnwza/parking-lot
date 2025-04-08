import { ParkingSpot } from "../../models/ParkingSpot";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const availableSpots = await ParkingSpot.find({ isOccupied: false }).populate("level");
      res.status(200).json(availableSpots);
    } catch (error) {
      res.status(500).json({ message: "Error fetching available spots" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}