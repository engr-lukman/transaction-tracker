const NODE_ENV = process.env.NODE_ENV || "development";

export const env = {
  nodeEnv: NODE_ENV,
  isProduction: NODE_ENV === "production",
  port: Number(process.env.PORT || 3001),
  mongoUri: process.env.MONGO_URI,
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  listLimit: 5,
};
