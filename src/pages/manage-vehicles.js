import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function ManageSpots() {
    const router = useRouter();
    const [vehicles, setVehicles] = useState([]);

    useEffect(() => {
        fetchVehicles();
    }, []);


    async function fetchVehicles() {
        const res = await fetch("/api/vehicles");
        const data = await res.json();
        setVehicles(data);
    }

    async function handleUnparkVehicle(vehicleId) {
        const res = await fetch(`/api/unpark`, {
          method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: vehicleId }),
        });
        if (res.ok) {
          fetchVehicles();
        }
      }
    
    async function handleDeleteVehicle(vehicleId) {
        const res = await fetch(`/api/vehicles`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: vehicleId }),
        });
        if (res.ok) {
            fetchVehicles();
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-10 text-sm">
        <div className="flex justify-between items-center mb-3">
            <button onClick={() => router.back()} className="px-3 py-1 bg-zinc-500 text-white">Back</button>  
            <h1 className="text-xl font-semibold mr-1">Vehicles</h1>
        </div>   
            <table className="w-full border text-left">
            <thead>
                <tr className="bg-gray-100">
                <th className="p-2 border whitespace-nowrap w-auto">License Plate</th>
                <th className="p-2 border whitespace-nowrap w-auto">Type</th>
                <th className="p-2 border whitespace-nowrap w-auto">Parked Spots</th>
                <th className="p-2 border whitespace-nowrap w-auto">Actions</th>
                </tr>
            </thead>
            <tbody>
                {vehicles.map((vehicle) => (
                <tr key={vehicle._id}>
                    <td className="p-2 border whitespace-nowrap w-auto">{vehicle.licensePlate}</td>
                    <td className="p-2 border whitespace-nowrap w-auto">{vehicle.size}</td>
                    <td className="p-2 border whitespace-nowrap w-auto">
                        {vehicle.parkedSpots.length > 0
                        ? vehicle.parkedSpots.map((spot) => spot.spotNumber).join(", ")
                        : "-"}</td>
                    <td className="p-2 border space-x-2">
                    <button
                        className="px-2 py-1 text-xs bg-yellow-200"
                        onClick={() => handleUnparkVehicle(vehicle._id)}
                    >
                        Unpark
                    </button>
                    <button
                        className="px-2 py-1 text-xs bg-red-300"
                        onClick={() => handleDeleteVehicle(vehicle._id)}
                    >
                        Delete
                    </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
            </div>
    );
    }
