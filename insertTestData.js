import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import { calculateAge, classesList } from './utils/helper.js';
import { getSequenceId } from './controllers/sharedController.js';
import Student from './models/studentModel.js';
import Teacher from './models/teacherModel.js'
dotenv.config();

const connectionURI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(connectionURI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Function to generate random student data
const generateRandomStudent = async () => {
    const randomGender = faker.helpers.arrayElement(['Male', 'Female', 'Other']);
    const randomStatus = faker.helpers.arrayElement(["active", "suspended", "left", "graduated"]);
    const randomPayment = faker.helpers.arrayElement(['card', 'cash']);
    const randomClass = faker.helpers.arrayElement(classesList.map(cls => cls.value));
    // Calculate the date range for a birthdate between 4 and 18 years ago

    // Generate a birthdate within the specified range
    const randomDateOfBirth = faker.date.between({ from: '2004-01-01', to: Date.now() });;

    // Calculate age based on the random date of birth
    const studentAge = calculateAge(randomDateOfBirth);

    // Use async-await for getSequenceId
    const scEnrollId = await getSequenceId("66ec1ee9c39df3d6cf45d88a", "student");


    return {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        date_of_birth: randomDateOfBirth,
        email: faker.internet.email(),
        class_name: randomClass,
        address: faker.location.streetAddress(),
        parent_first_name: faker.person.firstName(),
        parent_last_name: faker.person.lastName(),
        phone: `${faker.number.int({ min: 1000, max: 9999 })}-${faker.number.int({ min: 100, max: 999 })}-${faker.number.int({ min: 1000, max: 9999 })}`,
        payment: randomPayment,
        b_form: `${faker.number.int({ min: 10000, max: 99999 })}-${faker.number.int({ min: 1000000, max: 9999999 })}-${faker.number.int({ min: 1, max: 9 })}`,
        cnic_number: `${faker.number.int({ min: 10000, max: 99999 })}-${faker.number.int({ min: 1000000, max: 9999999 })}-${faker.number.int({ min: 1, max: 9 })}`,
        gender: randomGender,
        status: randomStatus,
        profile_color: faker.internet.color(),
        profile_image: "",
        student_age: studentAge,
        sc_enroll_id: scEnrollId,
        school_id: "66ec1ee9c39df3d6cf45d88a", // Replace with a valid school ID from your database
    };

};
const generateRandomTeacher = async () => {
    const randomGender = faker.helpers.arrayElement(['Male', 'Female', 'Other']);
    const randomStatus = faker.helpers.arrayElement(["active", "suspended", "left"]);
    const scJoinId = await getSequenceId("66ec1ee9c39df3d6cf45d88a", "teacher");

    // Generate random start and end dates for the degree (assuming degree takes 3-5 years)
    const degreeStartDate = faker.date.past({ years: 10, refDate: Date.now() })   // Degree started within the past 10 years
    const degreeEndDate = faker.date.between({ from: degreeStartDate, to: Date.now() }); // Degree ended between start date and now
    const universities = [
        'Harvard University',
        'Stanford University',
        'Massachusetts Institute of Technology',
        'University of Oxford',
        'University of Cambridge',
        'California Institute of Technology',
        'University of Chicago',
        'Princeton University',
        'Yale University'
    ]
    return {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        address: faker.location.streetAddress(),
        phone: `${faker.number.int({ min: 1000, max: 9999 })}-${faker.number.int({ min: 100, max: 999 })}-${faker.number.int({ min: 1000, max: 9999 })}`,
        cnic_number: `${faker.number.int({ min: 10000, max: 99999 })}-${faker.number.int({ min: 1000000, max: 9999999 })}-${faker.number.int({ min: 1, max: 9 })}`,
        gender: randomGender,
        status: randomStatus,
        profile_color: faker.internet.color(),
        profile_image: "", // You can add a random image here if needed, e.g., faker.image.avatar()
        university: faker.helpers.arrayElement(universities), // Random university
        degree_start_date: degreeStartDate,
        degree_end_date: degreeEndDate,
        degree_city: faker.location.city(), // Generates random city name for where the degree was obtained
        degree: faker.helpers.arrayElement(['Bachelors', 'Masters', 'PhD', 'Associate Degree', 'Diploma']), // Random degree level
        sc_join_id: scJoinId,
        school_id: "66ec1ee9c39df3d6cf45d88a", // Replace with a valid school ID from your database
    };

};

// Example call to generate a teacher

const insertBulk = async () => {
    const students = [];
    const teachers = [];
    for (let i = 0; i < 50; i++) {
        // students.push(await generateRandomStudent()); // Await for each student creation
        teachers.push(await generateRandomTeacher()); // Await for each teacher creation

    }

    try {
        // await Student.insertMany(students); // Bulk student insert into MongoDB
        await Teacher.insertMany(teachers); // Bulk teacher insert into MongoDB
        console.log('inserted successfully');
        mongoose.connection.close();
    } catch (error) {
        console.error('Error inserting students:', error);
        mongoose.connection.close();
    }
};

// Run the insertion script
insertBulk();
