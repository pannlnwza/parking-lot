import Database from "@/lib/Database";
import { ParkingSpot } from "@/models/ParkingSpot";

export default async function handler(req, res) {
  	await Database.getInstance().connect();

  	const { id } = req.query;

  	if (req.method === "DELETE") {
    	try {
      		await ParkingSpot.findByIdAndDelete(id);
      		res.status(200).json({ message: "Spot deleted" });
    	} catch (error) {
      		res.status(500).json({ error: "Failed to delete spot" });
    	}
  	} else {
    	res.status(405).end();
  	}
}
