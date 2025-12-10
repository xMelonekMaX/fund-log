module.exports = {
	apps: [
		{
			name: "fundlog",
			script: "./node_modules/.bin/next",
			args: "start",
			interpreter: "bash",
			env: {
				NODE_ENV: "production",
				PORT: 3001,
			},
			watch: false,
		},
	],
};
