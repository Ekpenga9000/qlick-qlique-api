const express = require('express');
const app = express(); 
const cors = require('cors');
require("dotenv").config();
const port = process.env.PORT;
const userRouter = require('./routes/userRoutes'); 
const cliqueRouter = require("./routes/cliqueRoutes");
const postRouter = require("./routes/postRoutes");
const authRouter = require("./routes/authRoutes");


app.use(cors());
app.use(express.json());

app.use("/", authRouter);
// app.use("/user", userRouter);
// app.use("/post", postRouter);
// app.use("/clique", cliqueRouter);


app.listen(port, () => {
    console.log(`Server cooking 🔥🔥🔥 on ${port}!!!`);
})
