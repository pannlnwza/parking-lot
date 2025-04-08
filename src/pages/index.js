import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
	const router = useRouter();
	const [spots, setSpots] = useState("");
	const [licensePlate, setLicensePlate] = useState("");
	const [size, setSize] = useState("Car");
	const [selectedLevel, setSelectedLevel] = useState("");
	const [floor, setFloor] = useState("");
	const [levels, setLevels] = useState([]);
	const [vehicles, setVehicles] = useState([]);
	const [availableSpots, setAvailableSpots] = useState([]);
	const [spotGrid, setSpotGrid] = useState({});

  useEffect(() => {
    fetchVehicles();
    fetchLevels();
  }, []);

  async function fetchVehicles() {
    const res = await fetch("/api/vehicles");
    const data = await res.json();
    setVehicles(data);
  }

  async function fetchLevels() {
    try {
      const res = await fetch("/api/levels");
      if (!res.ok) 
        throw new Error("Failed to fetch levels");
      const data = await res.json();
      setLevels(data);
    } catch (error) {
      console.error("Error fetching levels:", error);
    }
  }

  async function fetchSpots(levelId) {
    if (!levelId) {
      setAvailableSpots([]);
      setSpotGrid({});
      return;
    }
    
    try {
      const res = await fetch(`/api/levels/${levelId}/spots`);
      const data = await res.json();
	  console.log("Fetched spots:", data);
      setAvailableSpots(data);
      
      // Organize spots into a grid by row
      const grid = {};
      data.forEach(spot => {
        if (!grid[spot.row]) {
          grid[spot.row] = [];
        }
        grid[spot.row].push(spot);
      });
      
      // Sort spots within each row by spotNumber
      Object.keys(grid).forEach(row => {
        grid[row].sort((a, b) => a.spotNumber - b.spotNumber);
      });
      
      setSpotGrid(grid);
    } catch (error) {
      console.error("Error fetching spots:", error);
    }
  }

  async function handleCreateLevel(e) {
    e.preventDefault();
    const res = await fetch("/api/levels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ floor: Number(floor), numberSpots: Number(spots) }),
    });
    if (res.ok) {
      alert("Level created");
      setFloor("");
      setSpots("");
      fetchLevels();
    } else {
		alert("Failed to create level");
	}
  }

  async function handleCreateVehicle(e) {
    e.preventDefault();
    const res = await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licensePlate, size }),
    });
    if (res.ok) {
      setLicensePlate("");
      fetchVehicles();
    }
  }

  async function handleParkVehicle(e) {
    e.preventDefault();

    const res = await fetch("/api/park", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ licensePlate: licensePlate, levelId: selectedLevel }),
    });

    if (res.ok) {
		alert("Vehicle parked successfully");
		setLicensePlate("");
		fetchSpots(selectedLevel);
		fetchVehicles();
    }
	else {
		alert("Failed to park vehicle");
	}
  }

  const renderSpot = (spot) => {
    const isOccupied = spot.vehicle;
    return (
      <div 
        key={spot._id} 
        className={`w-15 h-15 border flex items-center justify-center text-xs m-1 ${
          isOccupied ? "bg-red-100 border-red-300" : "bg-green-100 border-green-300"
        }`}
        title={isOccupied ? `Occupied by ${spot.vehicle.licensePlate}` : "Available"}
      >
        {spot.spotNumber}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-10 text-sm text-gray-800">
      <h1 className="text-xl font-bold mb-6 text-left">Parking Lot</h1>

	  <form onSubmit={handleCreateLevel} className="space-y-2 mb-6">
        <h2 className="font-medium">Add Level</h2>
        <input
          type="number"
          value={floor}
          onChange={(e) => setFloor(e.target.value)}
          placeholder="Floor Number"
          className="w-full p-1 border"
          required
        />
        <input
          type="number"
          value={spots}
          onChange={(e) => setSpots(e.target.value)}
          placeholder="Number of Spots"
          className="w-full p-1 border"
          required
        />
        <button className="w-full p-1 bg-pink-300 text-white" type="submit">Add Level</button>
      </form>

      <form onSubmit={handleCreateVehicle} className="space-y-2 mb-6">
        <h2 className="font-medium">Create Vehicle</h2>
        <input
          type="text"
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value)}
          placeholder="License plate"
          className="w-full p-1 border"
          required
        />
        <select
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className="w-full p-1 border"
        >
          <option>Motorcycle</option>
          <option>Car</option>
          <option>Bus</option>
        </select>
        <button className="w-full p-1 bg-pink-300 text-white" type="submit">Add Vehicle</button>
      </form>

      <form onSubmit={handleParkVehicle} className="space-y-2 mb-6">
        <h2 className="font-medium">Park Vehicle</h2>
        <select
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value)}
          className="w-full p-1 border"
        >
          <option value="">Select a vehicle</option>
          {vehicles.map((v) => (
            <option key={v._id} value={v.licensePlate}>
              {v.licensePlate} ({v.size})
            </option>
          ))}
        </select>

        <select
          value={selectedLevel}
          onChange={(e) => {
            setSelectedLevel(e.target.value);
            fetchSpots(e.target.value);
          }}
          className="w-full p-1 border"
        >
          <option value="">Select level</option>
          {levels.map((lvl) => (
            <option key={lvl._id} value={lvl._id}>Level {lvl.floor}</option>
          ))}
        </select>

        <button
          type="submit"
          className="w-full p-1 bg-pink-300 text-white"
        >
          Park Vehicle
        </button>
      </form>
	  <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-medium font-semibold">Parking Spots</h2>
          <button className="px-3 py-1 bg-zinc-500 text-white" onClick={() => router.push("/manage-spots")}>
            Manage
          </button>
        </div>

        <div className="mb-4">
          <select
            value={selectedLevel}
            onChange={(e) => {
              setSelectedLevel(e.target.value);
              fetchSpots(e.target.value);
            }}
            className="w-full p-1 border"
          >
            <option value="">Select a level to view spots</option>
            {levels.map((lvl) => (
              <option key={lvl._id} value={lvl._id}>Level {lvl.floor}</option>
            ))}
          </select>
        </div>

        {selectedLevel && (
          <div className="mt-4">
            
            {Object.keys(spotGrid).length === 0 && (
              <p className="text-gray-500">No spots available on this level</p>
            )}
            
            {Object.keys(spotGrid).sort().map(row => (
              <div key={row} className="mb-0.5">
                <div className="text-xs text-gray-500 ml-1">Row {row}</div>
                <div className="flex flex-wrap">
                  {spotGrid[row].map(spot => renderSpot(spot))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-medium font-semibold mb-2">Levels Overview</h2>
        {levels.map((level) => (
          <div key={level._id} className="mb-1">
            Level {level.floor} - {level.availableSpots} spots available
          </div>
        ))}
      </div>
    </div>
  );
}
