import { config } from "dotenv";
import mongoose from "mongoose";
import Subject from "./models/subjectModel.js"; // Import the Subject model
config()
// Connect to the MongoDB database
const connectionURI = process.env.MONGO_URI;

mongoose.connect(connectionURI).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
});

const subjects = [
    {
        name: "Math",
        type: "compulsory",
        classes: [
            "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"
        ]
    },
    {
        name: "English",
        type: "compulsory",
        classes: [
            "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"
        ]
    },
    {
        name: "Science",
        type: "compulsory",
        classes: [
            "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"
        ]
    },
    {
        name: "Social Studies",
        type: "compulsory",
        classes: [
            "VI", "VII", "VIII", "IX", "X"
        ]
    },
    {
        name: "History",
        type: "compulsory",
        classes: [
            "IX", "X"
        ]
    },
    {
        name: "Geography",
        type: "compulsory",
        classes: [
            "VI", "VII", "VIII", "IX", "X"
        ]
    },
    {
        name: "Civics",
        type: "compulsory",
        classes: [
            "VI", "VII", "VIII", "IX", "X"
        ]
    },
    {
        name: "Arts",
        type: "elective",
        classes: [
            "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"
        ]
    },
    {
        name: "Music",
        type: "elective",
        classes: [
            "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"
        ]
    },
    {
        name: "Physical Education",
        type: "elective",
        classes: [
            "VI", "VII", "VIII", "IX", "X"
        ]
    },
    {
        name: "Computer Science",
        type: "elective",
        classes: [
            "IX", "X"
        ]
    },
    {
        name: "Business Studies",
        type: "elective",
        classes: [
            "IX", "X"
        ]
    },
    {
        name: "Environmental Science",
        type: "elective",
        classes: [
            "VI", "VII", "VIII", "IX", "X"
        ]
    },
    {
        name: "Home Economics",
        type: "elective",
        classes: [
            "VI", "VII", "VIII", "IX", "X"
        ]
    },
    {
        name: "Foreign Language (French)",
        type: "elective",
        classes: [
            "VI", "VII", "VIII", "IX", "X"
        ]
    },
    {
        name: "Foreign Language (Spanish)",
        type: "elective",
        classes: [
            "VI", "VII", "VIII", "IX", "X"
        ]
    },
    {
        name: "Foreign Language (German)",
        type: "elective",
        classes: [
            "VI", "VII", "VIII", "IX", "X"
        ]
    },
    {
        name: "Vocational Studies",
        type: "elective",
        classes: [
            "VI", "VII", "VIII", "IX", "X"
        ]
    }
];


// Function to insert subjects into the database
async function insertSubjects() {
    for (const subject of subjects) {

        const isCompulsory = subject.type === 'compulsory';
        const newSubject = new Subject({
            subject_name: subject.name,
            is_compulsory: isCompulsory,
            classes: subject.classes
        });

        try {
            await newSubject.save();
            console.log(`Inserted subject: ${subject.name}`);
        } catch (error) {
            console.error(`Error inserting subject: ${subject.name}`, error.message);
        }
    }

    mongoose.connection.close();
}

// Run the script
insertSubjects();