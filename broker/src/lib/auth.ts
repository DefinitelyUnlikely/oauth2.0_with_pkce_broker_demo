import { betterAuth } from 'better-auth';
import { MssqlDialect } from 'kysely';
import * as Tedious from 'tedious';
import * as Tarn from 'tarn';

const dialect = new MssqlDialect({
	tarn: {
		...Tarn,
		options: {
			min: 0,
			max: 10
		}
	},
	tedious: {
		...Tedious,
		connectionFactory: () =>
			new Tedious.Connection({
				authentication: {
					options: {
						password: 'password123!',
						userName: 'sa'
					},
					type: 'default'
				},
				options: {
					database: 'broker',
					port: 1433,
					trustServerCertificate: true
				},
				server: 'localhost'
			})
	}
});

export const auth = betterAuth({
	database: {
		dialect,
		type: 'mssql'
	}
});
