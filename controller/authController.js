const knex = require("knex")(require("../knexfile"));
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const login = async (req, res) => {
  try {
    if (!req.body.text || !req.body.password) {
      return res.status(400).send("Please fill the required fields");
    }
    const user = await knex("user")
      .where({ username: req.body.text })
      .orWhere({ email: req.body.text })
      .first();

    if (!user) {
      return res.status(400).send("Invalid Login credentials");
    }

    if (user) {
      const isPasswordCorrect = bcrypt.compareSync(
        req.body.password,
        user.password_hash
      );

      if (!isPasswordCorrect) {
        return res.status(400).send("Invalid Login credentials");
      }
    }

    const payload = { id: user.id };
    const token = jwt.sign(payload, process.env.SESSION_SECRET, {
      expiresIn: "1h",
    });
    return res.status(200).json({ token: token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: `We couldn't even connect to DB: ${err}` });
  }
};

const createUser = async (req, res) => {
  const {
    firstname,
    lastname,
    phone_number,
    email,
    password,
    confirm_pwd,
    date_of_birth,
    username,
  } = req.body;

  if (
    !firstname ||
    !lastname ||
    !email ||
    !password ||
    !confirm_pwd ||
    !phone_number ||
    !date_of_birth ||
    !username
  ) {
    return res.status(400).send("Please enter the required fields.");
  }

  if (password !== confirm_pwd) {
    return res.status(400).json({ message: "Passwords don't match." });
  }

  try {
    const keysToCheck = ["username", "email", "phone_number"];
    for (const key of keysToCheck) {
      const existingUser = await knex("user").where(key, req.body[key]).first();
      if (existingUser) {
        return res.status(409).json({
          message: `${
            key.charAt(0).toUpperCase() + key.slice(1)
          } already exists.`,
        });
      }
    }

    const avatar_url = "images/avatar.png";

    const newBio = `🌟 Living my best life and making each moment count on Clique. Let's make memories and spread positivity! 💕`;

    const hashedPassword = bcrypt.hashSync(password);
    const newUser = {
      firstname,
      lastname,
      email,
      phone_number,
      date_of_birth,
      avatar_url,
      username,
      password_hash: hashedPassword,
      bio: newBio,
      display_name: firstname + " " + lastname,
    };

    const [userId] = await knex("user").insert(newUser);

    // Create JWT
    const token = jwt.sign({ id: userId }, process.env.SESSION_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).json({ userId, token });
  } catch (err) {
    console.log(err);
    res.status(400).send("Failed registration");
  }
};

module.exports = {
  login,
  createUser,
};
