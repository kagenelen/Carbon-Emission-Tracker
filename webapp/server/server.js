/**
* @file Entry to backend. Contains list of routes for the server.
*/

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import users from "./routes/user.js";  // Import user route
import confirm_password from "./routes/change_password.js" //import changing password
import confirm_email from "./routes/change_email.js" //import changing email
import request_password_reset from "./routes/request_password_reset.js";
import jwt_authenticate from "./routes/jwt_authenticate.js";
import manage_project from "./routes/manage_project.js";
import graphs from "./routes/graphs.js";
import table_data from "./routes/table_data.js"
import predict_waste from "./routes/predict_waste.js";
import leaderboard_data from "./routes/leaderboard.js"

dotenv.config({ path: './config.env'});

console.log("Using database: ", process.env.DATABASE_NAME);

const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS to allow requests only from your frontend's origin
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],  // Allow specific HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'],  // Allow specific headers
}));

app.use(express.json());
app.use("/auth", jwt_authenticate);
app.use("/user", users); 
app.use("/change-password", confirm_password); 
app.use("/change-email", confirm_email);
app.use("/graphs", graphs);
app.use("/table-data", table_data);
app.use("/leaderboard", leaderboard_data);

app.use("/", request_password_reset);
app.use("/", manage_project);
app.use("/", predict_waste);


// start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
