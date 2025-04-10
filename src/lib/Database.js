import mongoose from "mongoose";

class Database {
  	static instance = null;

	constructor() {
		if (!process.env.MONGODB_URI) {
			throw new Error("Please define the MONGODB_URI environment variable");
		}
		this.uri = process.env.MONGODB_URI;
		this.connection = null;
  	}

  	async connect() {
		if (this.connection) {
			return this.connection;
		}

    	try {
			this.connection = await mongoose.connect(this.uri, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
				dbName: "ParkingLot",
			});
      		console.log("Connected to MongoDB");
      		return this.connection;
		} catch (error) {
			console.error("MongoDB connection error:", error);
			throw error;
		}
  }

  	static getInstance() {
    	if (!Database.instance) {
      		Database.instance = new Database();
    	}
    	return Database.instance;
  	}
}

export default Database;
