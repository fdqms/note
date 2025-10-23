import { surrealdbWasmEngines } from "@surrealdb/wasm";
import { ResponseError, Surreal } from "surrealdb";
import type { User } from "../types/user";
import { sha256 } from "js-sha256";

const db: Surreal = new Surreal({
	engines: surrealdbWasmEngines(),
});

await db.connect("indxdb://note");
await db.use({
	namespace: "note",
	database: "note",
});

const tables = await db.query("INFO FOR DB;");

if (!tables[0].tables?.user) {
	await db.query(`
			DEFINE TABLE user SCHEMAFULL;
			DEFINE FIELD username ON user TYPE string ASSERT $value != NONE;
			DEFINE FIELD password ON user TYPE string ASSERT $value != NONE;
			DEFINE INDEX username_unique_index ON user FIELDS username UNIQUE;
		`);
}

self.onmessage = async (event: MessageEvent) => {
	const { type, payload } = event.data;

	switch (type) {
		case "register":
			try {
				await db.create<User>("user", {
					...payload,
					password: sha256(`fdqmssalt${payload.password}`),
				});
				self.postMessage({ type: "register", data: true });
			} catch (e) {
				if(e instanceof ResponseError){
                    console.log(e);
                }
			}
			break;

		case "login": {
			const result: Omit<User, "username">[] = await db.query<
				Omit<User, "username">[]
			>("SELECT id, password FROM user WHERE username=$username", {
				username: payload.username,
			});

			if (result[0][0].password === sha256(`fdqmssalt${payload.password}`)) {
				self.postMessage({ type: "login", data: true });
			} else {
				self.postMessage({ type: "login", data: false });
			}
			break;
		}

		case "getAll": {
			const users = await db.select("user");
			self.postMessage({ type: "users", data: users });
			break;
		}
		default:
			console.warn("Unknown message typ:", type);
	}
};
