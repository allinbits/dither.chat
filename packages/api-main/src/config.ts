type Config = {
	READ_ONLY_PORT: number,
    WRITE_ONLY_PORT: number,
}

let config: Config;

export function useConfig(): Config {
	if (typeof config !== 'undefined') {
		return config;
	}

    config = {
		READ_ONLY_PORT: process.env.READ_ONLY_PORT ? parseInt(process.env.READ_ONLY_PORT) : 3000,
        WRITE_ONLY_PORT: process.env.WRITE_ONLY_PORT ? parseInt(process.env.WRITE_ONLY_PORT) : 3001
    };

	return config;
}
