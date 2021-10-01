const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");
const globalRouter = require("./routers/globalRouter");
const userRouter = require("./routers/userRouter");
const feedRouter = require("./routers/feedRouter");
const db = require("./models");
const TDDUserRouter = require("./TDD/TDD_userRouter");
const path = require("path");

const passportConfig = require("./passport");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const session = require("express-session");

db.sequelize
  .sync()
  .then(() => {
    console.log("🍀 Mysql Database Connected");
  })
  .catch(console.error);

passportConfig();

//Public settings
const app = express();
const PORT = process.env.PORT;

app.use(
  cors({
    origin: ["http://localhost:3000", "*"],
    credentials: true,
  })
);

// Env Settings
if (process.env.NODE_ENV === "development") {
  //DEV
  console.log("This Server Is Development Mode.");
} else {
  //PROD
  console.log("This Server Is Production Mode.");
  app.use(hpp());
  app.use(helmet());
}

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(
  session({
    saveUninitialized: false,
    resave: false,
    secret: process.env.COOKIE_SECRET,
    proxy: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res, next) => {
  return res.status(200).send("Back End Server");
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/tdd/user", TDDUserRouter);

app.use("/api", globalRouter);
app.use("/api/user", userRouter);
app.use("/api/feed", feedRouter);

app.listen(PORT, () => {
  console.log(`${PORT} Back rest api server start`);
});
