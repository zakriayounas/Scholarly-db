import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            validate: {
                validator: function (v) {
                    return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
                },
                message: (props) => `${props.value} is not a valid email!`,
            },
        },
        password: {
            type: String,
            required: true,
        },
        profile_color: {
            type: String,
            required: true,
        },
        // role: {
        //     type: String,
        //     enum: ['admin', 'teacher', 'student'],
        //     default: 'student'
        // }
    },
    {
        timestamps: true,
    }
);
const User = mongoose.model("User", userSchema);
export default User;
