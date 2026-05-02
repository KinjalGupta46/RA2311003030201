require("dotenv").config();

const express = require("express");
const app = express();

app.use(express.json());

const TOKEN = process.env.TOKEN;
const PORT = process.env.PORT || 3000;

async function fetchData(url) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${TOKEN}`
    }
  });

  return await response.json();
}

app.get("/", (req, res) => {
  res.send("Vehicle Maintenance Scheduler running");
});

app.get("/schedule", async (req, res) => {
  try {
    const depotsData = await fetchData("http://20.207.122.201/evaluation-service/depots");
    const vehiclesData = await fetchData("http://20.207.122.201/evaluation-service/vehicles");

    const depots = depotsData.depots || depotsData || [];
    const vehicles = vehiclesData.vehicles || vehiclesData || [];

    const schedules = depots.map((depot) => {
      const depotId = depot.depotId || depot.DepotID || depot.DepotId || depot.id;
      const capacity = depot.mechanicHours || depot.MechanicHours || depot.mechanic_hours || depot.capacity;

      const depotVehicles = vehicles
        .filter((v) => {
          const vehicleDepotId = v.depotId || v.DepotID || v.DepotId || v.depot_id;
          return String(vehicleDepotId) === String(depotId);
        })
        .sort((a, b) => {
          const impactA = a.impact || a.Impact;
          const durationA = a.duration || a.Duration;
          const impactB = b.impact || b.Impact;
          const durationB = b.duration || b.Duration;

          return (impactB / durationB) - (impactA / durationA);
        });

      let totalDuration = 0;
      let totalImpact = 0;
      let selectedTasks = [];

      for (const vehicle of depotVehicles) {
        const duration = vehicle.duration || vehicle.Duration;
        const impact = vehicle.impact || vehicle.Impact;
        const taskId = vehicle.taskId || vehicle.TaskID || vehicle.TaskId || vehicle.id;

        if (totalDuration + duration <= capacity) {
          totalDuration += duration;
          totalImpact += impact;
          selectedTasks.push(taskId);
        }
      }

      return {
        depotId,
        mechanicHours: capacity,
        totalDuration,
        totalImpact,
        selectedTasks
      };
    });

    res.json({ schedules });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});