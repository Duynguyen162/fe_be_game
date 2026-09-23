import { Server } from "socket.io";
import { createServer } from "http";
import { World, generateMap } from "@game/shared";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const map = generateMap(42);
const world = new World(map);

let tick = 0;
const TICK_RATE = 10; // 100ms per tick

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Gửi state ban đầu
  socket.emit("init", { seed: 42 });

  socket.on("command", (data) => {
    // Nhận lệnh từ client và broadcast cho mọi người (Lockstep)
    io.emit("command", { tick: tick + 2, ...data });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

setInterval(() => {
  tick++;
  io.emit("tick", tick);
}, TICK_RATE);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Game Server running on port ${PORT}`);
});
