import { useEffect, useRef, useState } from "react";
import "./App.css";
import type { User } from "./types/user";

function App() {
	const [username, setUsername] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [users, setUsers] = useState<User[]>([]);
	const [message, setMessage] = useState<string>("");
	const workerRef = useRef<Worker | null>(null);

	const usernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setUsername(e.target.value);
	};

	const passwordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(e.target.value);
	};

	const getAll = () => {
		if (!workerRef.current) return;

		workerRef.current.postMessage({
			type: "getAll",
		});
	};

	const login = () => {
		if (!workerRef.current) return;

		workerRef.current.postMessage({
			type: "login",
			payload: {
				username: username,
				password: password,
			},
		});
	};

	const register = () => {
		if (!workerRef.current) return;

		workerRef.current.postMessage({
			type: "register",
			payload: {
				username: username,
				password: password,
			},
		});
	};

	useEffect(() => {
		const worker = new Worker(
			new URL("workers/db.worker.ts", import.meta.url),
			{
				type: "module",
			},
		);

		worker.onmessage = (e) => {
			setMessage("");
			const { type, data } = e.data;

			switch (type) {
				case "register":
					console.log(data);
					if (data) {
						setMessage("register successfull");
					} else {
						setMessage("register unsuccessfull");
					}
					break;
				case "login":
					if (data) {
						setMessage("login successfull");
					} else {
						setMessage("login unsuccessfull");
					}
					break;
				case "users":
					setUsers(data as User[]);
					break;

				case "error":
					setMessage(data);
					break;
				default:
					break;
			}
		};

		workerRef.current = worker;
	}, []);

	return (
		<div>
			<input onChange={usernameChange} placeholder="username" />
			<input type="password" onChange={passwordChange} placeholder="password" />
			<button type="button" onClick={login}>
				login
			</button>
			<button type="button" onClick={register}>
				register
			</button>
			<button type="button" onClick={getAll}>
				get all
			</button>

			<ul>
				{users.map((user: User) => (
					<li key={user.id?.id}>
						{user.id?.id} {user.username} {user.password}
					</li>
				))}
			</ul>

			<span>{message}</span>
		</div>
	);
}

export default App;
