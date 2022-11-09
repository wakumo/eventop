export const configuration = () => {
  return {
    // Sample config.
    "sample.name": process.env.SAMPLE_NAME,

    // db config
    "db.host": process.env.DB_HOST,
    "db.port": process.env.DB_PORT,
    "db.user_name": process.env.DB_USER,
    "db.password": process.env.DB_PASSWORD,
    "db.name": process.env.DB_NAME,
    "db.name_test": process.env.DB_NAME_TEST,

    //redis config
    // "redis.host": process.env.REDIS_HOST,
    // "redis.port": process.env.REDIS_PORT,

    // rabbitmq config
    // "rabbitmq.host": process.env.RABBITMQ_HOST,
    // "rabbitmq.port": process.env.RABBITMQ_PORT,
  };
};
