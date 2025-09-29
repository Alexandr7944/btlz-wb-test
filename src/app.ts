import "dotenv/config";
import express from "express";
import Server from "#Server.js";

const app = express();
new Server(app);

let PORT = process.env.APP_PORT || 5000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}.`))
    .on("error", (err: any) => {
    err.code === "EADDRINUSE"
        ? console.log("Error: address already in use")
        : console.log(err);
});
