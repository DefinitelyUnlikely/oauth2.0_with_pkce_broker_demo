import { MssqlDialect, Kysely } from 'kysely';
import * as Tedious from 'tedious';
import * as Tarn from 'tarn';
import {
	MSSQL_SERVER,
	MSSQL_DATABASE,
	MSSQL_PORT,
	MSSQL_USER,
	MSSQL_PASSWORD
} from '$env/static/private';

export interface OAuthClient {
	id: string;
	secret: string;
	redirect_uri: string;
	name: string;
}

export interface OAuthCode {
	code: string;
	client_id: string;
	redirect_uri: string;
	expires_at: Date;
	code_challenge: string;
	code_challenge_method: string;
}

interface OAuthTables {
	oauth_clients: OAuthClient;
	oauth_codes: OAuthCode;
}

export const dialect = new MssqlDialect({
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
						password: MSSQL_PASSWORD,
						userName: MSSQL_USER
					},
					type: 'default'
				},
				options: {
					database: MSSQL_DATABASE,
					port: Number(MSSQL_PORT),
					trustServerCertificate: true
				},
				server: MSSQL_SERVER
			})
	}
});

export const db = new Kysely<OAuthTables>({
	dialect
});
