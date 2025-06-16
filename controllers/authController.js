const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const secretKey = process.env.JWT_SECRET;

async function registerUser(req, res) {
	// Pobieramy wszystkie potrzebne dane z ciała żądania
	let { firstName, lastName, username, email, password } = req.body;
	try {
		// Sprawdzamy, czy użytkownik z tym emailem lub nazwą już nie istnieje
		const duplicate = await User.findOne({
			$or: [{ username: username }, { email: email }],
		});
		if (duplicate) {
			return res
				.status(400)
				.send({
					message: "Użytkownik z tą nazwą lub adresem email już istnieje.",
				});
		}

		// Tworzymy nowego użytkownika, przekazując WSZYSTKIE dane
		let user = new User({
			firstName,
			lastName,
			username,
			email,
			password,
		});

		// Zapisujemy użytkownika do bazy (Mongoose automatycznie zahashuje hasło)
		const result = await user.save();
		console.log("Zarejestrowano nowego użytkownika:", result);

		res.status(201).send({ message: "User registered successfully!" });
	} catch (err) {
		console.log("Błąd podczas rejestracji:", err);
		res.status(400).send(err);
	}
}

async function loginUser(req, res) {
	try {
		const { username, password } = req.body; // W logowaniu można użyć username lub email

		// Pozwólmy użytkownikom logować się za pomocą emaila lub nazwy użytkownika
		const user = await User.findOne({
			$or: [{ username: username }, { email: username }],
		});

		if (!user) {
			return res.status(404).send({ message: "Błędne dane logowania." });
		}
		const isPasswordValid = await user.comparePassword(password);
		if (!isPasswordValid) {
			return res.status(404).send({ message: "Błędne dane logowania." });
		}
		let token = jwt.sign({ userId: user?._id }, secretKey, { expiresIn: "1h" });
		let finalData = {
			userId: user?._id,
			username: user?.username,
			firstName: user?.firstName,
			lastName: user?.lastName,
			email: user?.email,
			token,
		};
		res.send(finalData);
	} catch (err) {
		console.log("Błąd podczas logowania:", err);
		res.status(400).send(err);
	}
}

const AuthController = {
	registerUser,
	loginUser,
};

module.exports = AuthController;
