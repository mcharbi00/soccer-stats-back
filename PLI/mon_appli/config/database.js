const { default: mongoose } = require("mongoose")
mongoose.set('strictQuery', true);

const connection = () => {
    mongoose.connect(
        "mongodb+srv://loguetown:loguetown@cluster0.blqzn.mongodb.net/?retryWrites=true&w=majority"
    );
    const db = mongoose.connection;
    db.on("error", (err) => console.log(err));
    db.on("open", () => console.log("DATABASE : OK"));
};

module.exports = { connection }