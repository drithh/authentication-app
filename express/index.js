const express = require("express");
const { Pool } = require("pg");
require("dotenv").config();
// import bcrypt from "bcrypt";
const bcrypt = require("bcrypt");

const app = express();
const serverPort = 3001;

const [username, password, host, port, database] =
  process.env.DATABASE_URL.split(/[:@/]/g)
    .slice(3, 8)
    .map((x) => x.trim());
const pool = new Pool({
  user: username,
  password: password,
  host: host,
  port: port,
  database: database,
});

// Middleware untuk meng-handle body pada request
app.use(express.urlencoded({ extended: true }));

// Handler untuk route login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

  try {
    const result = await pool.query(
      `SELECT * FROM "User" WHERE email = '${email}'`
    );
    const user = result.rows[0];

    if (user) {
      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if (isPasswordValid) {
        res.status(200).send({ message: "login berhasil" });
      } else {
        // password salah
        res.status(404).send({ message: "password salah" });
      }
    } else {
      // Jika tidak ada user dengan email tersebut
      res.status(404).send({ message: "email tidak terdaftar" });
    }
  } catch (error) {
    // jika parameter yang dikirimkan tidak valid
    console.error("Error during login:", error);
    res.status(500).send({ message: "login gagal" });
  }
});

// Server listening
app.listen(serverPort, () => {
  console.log(`Server running on port ${serverPort}`);
});
