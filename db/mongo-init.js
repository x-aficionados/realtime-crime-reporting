db.createUser({
  user: process.env.MONGODB_DATABASE_USERNAME,
  pwd: process.env.MONGODB_DATABASE_PASSWORD,
  roles: [
    {
      role: "readWrite",
      db: process.env.MONGODB_NAME,
    },
  ],
});
