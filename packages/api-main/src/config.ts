type Config = {
	PORT: number,
    MONGO_URI: string
}

let config: Config;

export function useConfig(): Config {
	if (typeof config !== 'undefined') {
		return config;
	}

    if (!process.env.MONGO_URI) {
        console.error(`Failed to specify MONGO_URI in configuration`);
        process.exit(1);
    }

    config = {
        MONGO_URI: process.env.MONGO_URI,
		PORT: process.env.PORT ? parseInt(process.env.PORT) : 3000
    };

	return config;
}
