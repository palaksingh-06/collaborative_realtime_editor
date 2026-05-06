import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { YSocketIO } from "y-socket.io/dist/server";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
}));

app.use(express.json());
app.use(express.static("public"));

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const ySocketIO = new YSocketIO(io);
ySocketIO.initialize();


app.get("/health", (req, res) => {
  res.json({ message: "ok", success: true });
});



app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});


io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


httpServer.listen(3000, () => {
  console.log("server running on port 3000");
});