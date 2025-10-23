export type User = {
	id?: {
		tb: string;
		id: string;
	};
	username: string;
	password: string;
	[key: number]: User[];
};
