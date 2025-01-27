import mongoose from "mongoose";


function connect() {
    mongoose.connect(process.env.MONGO_URI)
        .then(c => {
            console.log(`Connected to MongoDB ${c.connection.host}`);
        })
        .catch(err => {
            console.log(err);
        })
}

export default connect;