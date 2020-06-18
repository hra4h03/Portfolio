const express = require("express");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const path = require("path");
const mailjet = require("node-mailjet").connect(
  "87eacb6ddcb996a2d6df95fa8bb03b51",
  "115192b08831cf9a19f72fe57e7a1bcc"
);
require("dotenv").config();
const app = express();

//view engine
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

//body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// static folder
app.use("/assets", express.static(path.join(__dirname, "views/assets")));

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function validate(req, res, next) {
  const user = req.body;
  if (user.email && user.message && user.name) {
    return next();
  }
  return res.redirect("/");
}

app.get("/", (req, res) => {
  res.render("home");
});

app.post("/send", validate, async (req, res) => {
  try {
    const { email, message, name } = req.body;

    const output = `
      <p>You have a new contact request from ${name}</p>
      <h3>Contact Details</h3>
      <ul style="list-style: none;">
        <li>Name: ${name}</li>
        <li>Email: ${email}</li>
      </ul>

      <h3>Message</h3>
      <p>${message}</p>
    `;

    const request = mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: "hr.ovakimyan.03@gmail.com",
            Name: name,
          },
          To: [
            {
              Email: "hr.ovakimyan.03@gmail.com",
              Name: "Hrach",
            },
          ],
          Subject: `Greetings from ${name}`,
          TextPart: "My first Mailjet",
          HTMLPart: output,
          CustomID: "AppGettingStartedTest",
        },
      ],
    });
    request
      .then((result) => {
        console.log(result.body);
      })
      .catch((err) => {
        console.log(err.statusCode);
      });
    res.redirect("/");
  } catch (error) {
    res.end(error.message);
  }
});

let port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("server started on port http://localhost:" + port);
});
