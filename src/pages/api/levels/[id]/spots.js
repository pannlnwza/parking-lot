import { ParkingSpot } from "@/models/ParkingSpot";
import { Level } from "@/models/Level";
import Database from "@/lib/Database";

export default async function handler(req, res) {
  	const { id } = req.query;
  	await Database.getInstance().connect();

  	switch (req.method) {
    	case "GET":
      		try {
        		const spots = await ParkingSpot.find({ level: id }).populate("vehicle");
        		res.status(200).json(spots);
      		} catch (error) {
        		res.status(500).json({ message: "Error fetching spots", error });
      		}
      		break;

    case "POST":
    	const { row, spotNumber, size } = req.body;
      	try {
			const newSpot = await ParkingSpot.create({
				level: id,
				row,
				spotNumber,
				size,
			});

        	await newSpot.save();
        	res.status(201).json(newSpot);
      	} catch (error) {
        	res.status(500).json({ message: "Error creating parking spot", error });
      	}
      	break;

    default:
      res.status(405).json({ message: "Method not allowed" });
  }
}
