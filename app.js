const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;
const initializeDbandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbandServer();

const convertPlayertoObj = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
  select * from cricket_team;
  `;
  const playersArray = await db.all(getPlayersQuery);
  response.send(playersArray.map((playItem) => convertPlayertoObj(playItem)));
});

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const playerAddQuery = `
    insert into cricket_team(player_name,jersey_number,role)
    values("${playerName}",${jerseyNumber},"${role}");
    `;
  const player = db.run(playerAddQuery);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = `
    select * from cricket_team
    where player_id=${playerId};
    `;
  const player = await db.get(playerDetails);
  response.send(convertPlayertoObj(player));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const { playerId } = request.params;
  const updateQuery = `
    update cricket_team
    set 
    player_name="${playerName}",
    jersey_number=${jerseyNumber},
    role="${role}"
    where player_id=${playerId};
    `;
  await db.run(updateQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const delQuery = `
    delete from cricket_team
    where player_id=${playerId};
    `;
  await db.run(delQuery);
  response.send("Player Removed");
});

module.exports = app;
