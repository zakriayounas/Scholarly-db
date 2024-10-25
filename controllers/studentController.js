import SchoolClass from "../models/classModel.js";
import Student from "../models/studentModel.js";
import { calculateAge, getRandomColor } from "../utils/helper.js";
import { getItemById, getSequenceId, handleFetchQuery } from "./sharedController.js";

// check class capacity
const validateClassCapacity = (classToUpdate, studentToAdd, res) => {
    // Check if the class has space
    if (classToUpdate.active_students_count + studentToAdd > classToUpdate.class_capacity) {
        return res.status(400).json({
            message: "Class does not have enough capacity",
            class_capacity: classToUpdate.class_capacity,  // Change to classToUpdate
            active_students_count: classToUpdate.active_students_count,  // Change to classToUpdate
            required_capacity: studentToAdd,
        });
    }
    // If capacity is not full, return true to continue processing
    return true;
};


const populateStudentClass = {
    path: 'class_id',
    select: 'class_name section_id has_multiple_sections',  // Add class_name and has_multiple_sections
    populate: {
        path: 'section_id',
        select: 'section_name color'
    }
};

// Helper to format student data
const formatStudentWithClass = (student) => {
    const { class_id } = student;
    return {
        ...student,
        class: {
            class_id: class_id?._id,
            class_name: class_id?.class_name || 'N/A',  // Fallback for missing data
            has_multiple_sections: class_id?.has_multiple_sections || false,
            section_name: class_id?.section_id?.section_name || 'N/A',  // Fallback for missing section
            color: class_id?.section_id?.color || 'N/A'
        }
    };
};

// handle Student Count update
const handleStudentCountUpdate = async (class_id, school, type, prevStatus, newStatus, res) => {
    // Find the class to check for capacity
    const classToUpdate = await SchoolClass.findById(class_id);

    if (!classToUpdate) {
        return res.status(400).json({ message: "Class not found." });
    }

    if (type === "add") {
        // Validate capacity and return if the class is full
        if (!validateClassCapacity(classToUpdate, 1, res)) return;

        classToUpdate.active_students_count += 1;
        school.total_students += 1;
        school.active_students += 1;
    } else if (type === "status_update") {
        if (prevStatus !== newStatus) {
            // Handle the case when moving out of "active"
            if (prevStatus === "active") {
                classToUpdate.active_students_count -= 1;
                school.active_students -= 1;
            } else if (prevStatus === "suspended") {
                school.suspended_students -= 1;
            } else if (prevStatus === "left") {
                school.left_students -= 1;
            } else if (prevStatus === "graduated") {
                school.graduated_students -= 1;
            }

            // Handle the case when moving into "active"
            if (newStatus === "active") {
                // Validate class capacity before activating the student
                if (!validateClassCapacity(classToUpdate, 1, res)) return;

                classToUpdate.active_students_count += 1;
                school.active_students += 1;
            } else if (newStatus === "suspended") {
                school.suspended_students += 1;
            } else if (newStatus === "left") {
                school.left_students += 1;
            } else if (newStatus === "graduated") {
                school.graduated_students += 1;
            }
        }

    }

    // Save class and school updates
    await classToUpdate.save();
    await school.save();
};



//  fetch School or specific class students
export const fetchStudents = async (req, res) => {
    const class_id = req?.params?.class_id || null;

    const fetchQueryResult = await handleFetchQuery(req, class_id);

    // Check if there was an error
    if (fetchQueryResult.error) {
        return res.status(400).json({ message: fetchQueryResult.message }); // Return error response
    }

    // Destructure the values returned by handleFetchQuery
    const { query, sortBy, school, items_per_page, skip_items } = fetchQueryResult;
    try {
        // Count total number of students matching the query
        const totalStudents = await Student.countDocuments(query);

        // Calculate the last page
        const lastPage = Math.ceil(totalStudents / items_per_page);
        const last_page_url = `/schools/${school._id}${class_id ? `/classes/${class_id}` : ""}/students?page=${lastPage}`;

        // Fetch students with pagination, sorting, and class population
        const studentsList = await Student.find(query)
            .populate(populateStudentClass)
            .lean()  // Use lean for better performance
            .select('-payment -b_form -cnic_number -date_of_birth -student_age -address -school_id')
            .limit(items_per_page)
            .skip(skip_items)
            .sort(sortBy);

        // Format the student data
        const formattedStudents = studentsList.map(student => formatStudentWithClass(student));


        // Return the formatted data in the response
        res.status(200).json({
            students: formattedStudents,
            per_page: items_per_page,
            total_items: totalStudents,
            last_page_url,
            school: school,
        });

    } catch (error) {
        // Enhanced error handling
        console.error('Error fetching students:', error); // Log the error for debugging
        res.status(500).json({ message: 'Internal Server Error', details: error.message });
    }
};

//  add new student
export const addNewStudent = async (req, res) => {
    const { date_of_birth, class_id } = req.body;

    const school = req.school;

    try {
        // Generate the student's enrollment ID and other details
        const sc_enroll_id = await getSequenceId(school._id, "student");
        const profile_color = getRandomColor();
        const student_age = calculateAge(date_of_birth);
        const profile_image = req.file ? req.file.path : "";
        // Create a new student
        await handleStudentCountUpdate(class_id, school, "add", null, null, res)
        const newStudent = new Student({
            ...req.body,
            student_age,
            profile_image,
            profile_color,
            school_id: school._id,
            sc_enroll_id,
        });

        const savedStudent = await newStudent.save();

        res.status(201).json({
            message: "Student added successfully!",
            student: savedStudent,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// view student details
export const viewStudentDetails = async (req, res) => {
    const { student_id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(student_id)) {
        return res.status(400).json({ message: "Invalid student ID" });
    }
    try {
        // Fetch the existing student with class population
        const existingStudent = await getItemById(student_id, "student", res)
            .populate(populateStudentClass)  // Populate class and section details
            .lean();  // Convert to plain JavaScript object

        // Format the student details
        const student_details = formatStudentWithClass(existingStudent);

        res.status(200).json({
            student_details,
        });
    } catch (error) {
        const statusCode = error.message === "Invalid student ID" ? 400 : 404;
        res
            .status(statusCode)
            .json({ message: error.message });
    }
};
// update student details
export const updateStudentDetails = async (req, res) => {
    const { student_id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(student_id)) {
        return res.status(400).json({ message: "Invalid student ID" });
    }
    const {
        first_name,
        last_name,
        date_of_birth,
        b_form,
        gender,
        address,
        parent_first_name,
        parent_last_name,
        phone,
        email,
        payment,
        cnic_number,
    } = req.body;

    try {
        const existingStudent = getItemById(student_id, "student", res)

        if (b_form && b_form !== existingStudent.b_form) {
            const bFormExistAlready = await Student.findOne({ b_form });
            if (bFormExistAlready) {
                return res
                    .status(400)
                    .json({ message: "B-form already in use by another student" });
            }
            existingStudent.b_form = b_form;
        }
        const profile_image = req.file
            ? req.file.path
            : existingTeacher.profile_image;
        const student_age = calculateAge(date_of_birth);
        const fieldsToUpdate = {
            first_name,
            last_name,
            date_of_birth,
            gender,
            profile_image,
            address,
            parent_first_name,
            parent_last_name,
            phone,
            email,
            payment,
            cnic_number,
            student_age,
        };

        Object.keys(fieldsToUpdate).forEach((field) => {
            if (fieldsToUpdate[field] !== undefined) {
                existingStudent[field] = fieldsToUpdate[field];
            }
        });

        const updatedStudent = await existingStudent.save();
        res.status(200).json({
            message: "Student updated successfully!",
            student: updatedStudent,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// update student status
export const updateStudentStatus = async (req, res) => {
    const { student_id, status } = req.body;
    const school = req.school;
    if (!mongoose.Types.ObjectId.isValid(student_id)) {
        return res.status(400).json({ message: "Invalid student ID" });
    }
    try {
        const existingStudent = getItemById(student_id, "student", res)
        // handling status count for class and school
        await handleStudentCountUpdate(existingStudent.class_id, school, "status_update", existingStudent.status, status, res)

        // Update the student's status before saving
        existingStudent.status = status;
        // Save the updated student
        const updatedStudent = await existingStudent.save();

        res.status(200).json({
            message: "Student status updated successfully!",
            student: updatedStudent,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// update student class
export const moveStudentsToOtherClass = async (req, res) => {
    const { students, new_class_id } = req.body;
    try {
        const newClass = await getItemById(new_class_id, "class", res);
        // Find all students from the given array of student IDs
        const studentList = await Student.find({ _id: { $in: students } });

        // Use the class of the first student to find the old class
        const old_class_id = studentList[0].class_id;
        const oldClass = await getItemById(old_class_id, "class", res);

        // Count the number of active students being transferred
        const activeStudentsCount = studentList.filter(student => student.status === "active").length;

        // Check if the new class has enough capacity for active students
        if (!validateClassCapacity(newClass, activeStudentsCount, res)) return;

        // Process each student and update their class and the active student count
        for (const student of studentList) {
            if (student.status === "active") {
                // Decrease the active student count in the old class
                oldClass.active_students_count -= 1;

                // Increase the active student count in the new class
                newClass.active_students_count += 1;
            }

            // Update the student's class
            student.class_id = new_class_id;
            await student.save();
        }

        // Save the updated old and new class
        await oldClass.save();
        await newClass.save();

        res.status(200).json({
            message: "Students moved to the new class successfully!",
            moved_students: studentList,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

