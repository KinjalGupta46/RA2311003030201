require('dotenv').config();
const TOKEN = process.env.TOKEN;

async function Log(stack, level, packageName, message) {
  try {
    const res = await fetch("http://20.207.122.201/evaluation-service/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TOKEN}`
      },
      body: JSON.stringify({
        stack,
        level,
        package: packageName,
        message
      })
    });

    const data = await res.json();
    console.log(data);

  } catch (err) {
    console.log("Error:", err);
  }
}

// test call
Log("backend", "info", "route", "test log from code");