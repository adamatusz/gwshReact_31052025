import React, { useState } from "react";
import styles from "./Login.module.css";
import login from "../../assets/login.png";
import { Button, Input, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { getErrorMessage } from "../../util/GetError";
import AuthServices from "../../services/authServices";
import axios from "axios"; // Potrzebne do obsługi błędów z serwera

function Register() {
	//  Używamy jednego obiektu do przechowywania danych formularza i drugiego do błędów
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	//  Uniwersalna funkcja do obsługi zmian we wszystkich polach
	const handleChange = e => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
		// Czyścimy błąd danego pola, gdy użytkownik zaczyna pisać
		if (errors[name]) {
			setErrors({
				...errors,
				[name]: undefined,
			});
		}
	};

	// Funkcja walidacji przeniesiona z pliku .tsx
	const validateForm = () => {
		const newErrors = {};
		let isValid = true;

		// Walidacja imienia, nazwiska i nazwy użytkownika
		if (!formData.firstName.trim()) {
			newErrors.firstName = "Imię jest wymagane.";
			isValid = false;
		}
		if (!formData.lastName.trim()) {
			newErrors.lastName = "Nazwisko jest wymagane.";
			isValid = false;
		}
		if (!formData.username.trim()) {
			newErrors.username = "Nazwa użytkownika jest wymagana.";
			isValid = false;
		}

		// Walidacja emaila
		if (!formData.email.trim()) {
			newErrors.email = "Email jest wymagany.";
			isValid = false;
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = "Podaj poprawny adres email.";
			isValid = false;
		}

		// Walidacja hasła 
		if (!formData.password) {
			newErrors.password = "Hasło jest wymagane.";
			isValid = false;
		} else {
			if (formData.password.length < 8) {
				// Zostawmy bardziej rygorystyczne wymagania
				newErrors.password =
					(newErrors.password || "") + "Hasło musi mieć co najmniej 8 znaków. ";
			}
			if (!/[A-Z]/.test(formData.password)) {
				newErrors.password =
					(newErrors.password || "") + "Musi zawierać dużą literę. ";
			}
			if (!/[a-z]/.test(formData.password)) {
				newErrors.password =
					(newErrors.password || "") + "Musi zawierać małą literę. ";
			}
			if (!/[0-9]/.test(formData.password)) {
				newErrors.password =
					(newErrors.password || "") + "Musi zawierać cyfrę. ";
			}
		}

		// Walidacja powtórzenia hasła
		if (!formData.confirmPassword) {
			newErrors.confirmPassword = "Powtórzenie hasła jest wymagane.";
			isValid = false;
		} else if (
			formData.password &&
			formData.confirmPassword !== formData.password
		) {
			newErrors.confirmPassword = "Hasła nie są takie same.";
			isValid = false;
		}

		setErrors(newErrors);
		return isValid;
	};

	// Zaktualizowana funkcja handleSubmit
	const handleSubmit = async () => {
		// Najpierw walidujemy formularz po stronie klienta
		if (validateForm()) {
			setLoading(true);
			setErrors({}); // Czyścimy stare błędy serwera
			try {
				const data = {
					firstName: formData.firstName,
					lastName: formData.lastName,
					username: formData.username,
					email: formData.email, // dodajemy email
					password: formData.password,
				};
				// Wywołujemy serwis API 
				const response = await AuthServices.registerUser(data);
				console.log(response.data);
				setLoading(false);
				message.success("Zarejestrowano pomyślnie! Sprawdź email powitalny.");
				navigate("/login");
			} catch (err) {
				console.log(err);
				setLoading(false);
				// obsługa błędów z serwera
				if (axios.isAxiosError(err) && err.response) {
					const serverMessage = getErrorMessage(err, "Coś poszło nie tak.");
					setErrors({ general: serverMessage });
				} else {
					setErrors({ general: "Błąd sieci lub serwer nie odpowiada." });
				}
			}
		} else {
			console.log("Formularz zawiera błędy, zatrzymano wysyłanie.");
		}
	};

	return (
		<div>
			<form className={styles.login__card}>
				<img src={login} alt='..' />
				<h2>Register</h2>
				 {/* Aktualizacja JSX - nowe pola i obsługa błędów */}
				<div className={styles.input__inline__wrapper}>
					<Input
						name='firstName' 
						placeholder='First Name'
						value={formData.firstName}
						onChange={handleChange}
					/>
					<Input
						name='lastName' 
						placeholder='Last Name'
						style={{ marginLeft: "10px" }}
						value={formData.lastName}
						onChange={handleChange}
					/>
				</div>
				{errors.firstName && (
					<p className={styles.errorText}>{errors.firstName}</p>
				)}
				{errors.lastName && (
					<p className={styles.errorText}>{errors.lastName}</p>
				)}

				<div className={styles.input__wrapper}>
					<Input
						name='username'
						placeholder='Username'
						value={formData.username}
						onChange={handleChange}
					/>
					{errors.username && (
						<p className={styles.errorText}>{errors.username}</p>
					)}
				</div>

				{/* NOWE POLE EMAIL */}
				<div className={styles.input__wrapper}>
					<Input
						name='email'
						type='email'
						placeholder='Email'
						value={formData.email}
						onChange={handleChange}
						autoComplete='email'
					/>
					{errors.email && <p className={styles.errorText}>{errors.email}</p>}
				</div>

				<div className={styles.input__wrapper}>
					<Input.Password
						name='password' 
						placeholder='Password'
						value={formData.password}
						onChange={handleChange}
						autoComplete='new-password'
					/>
					{errors.password && (
						<p className={styles.errorText} style={{ whiteSpace: "pre-line" }}>
							{errors.password}
						</p>
					)}
				</div>

				{/* NOWE POLE POWTÓRZ HASŁO */}
				<div className={styles.input__wrapper}>
					<Input.Password
						name='confirmPassword'
						placeholder='Confirm Password'
						value={formData.confirmPassword}
						onChange={handleChange}
						autoComplete='new-password'
					/>
					{errors.confirmPassword && (
						<p className={styles.errorText}>{errors.confirmPassword}</p>
					)}
				</div>

				<div className={styles.input__info}>
					Existing User? <Link to='/login'>Login</Link>
				</div>
				{errors.general && <p className={styles.errorText}>{errors.general}</p>}
				<Button
					loading={loading}
					type='primary'
					size='large'
					onClick={handleSubmit}>
					Register
				</Button>
			</form>
		</div>
	);
}

export default Register;
