import Redis from 'ioredis';



const redisClient = new Redis({
    host: 'redis-19655.crce179.ap-south-1-1.ec2.redns.redis-cloud.com',
    port: '19655',
    password: 'chtxWtbhj60q2q0s7oEyKtPJm4MWyszp'
});


redisClient.on('connect', () => {
    console.log('Redis connected');
})

export default redisClient;