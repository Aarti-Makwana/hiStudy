import { Instructor } from "../../../apiEndPoints";
import { logger } from "../../../utils";
import APIrequest from "../../axios";

export const InstructorServices = {
    getAllInstructors: async () => {
        try {
            const payload = {
                ...Instructor.getAllInstructors,
            };
            const res = await APIrequest(payload);
            return res;
        } catch (error) {
            logger(error);
            throw error;
        }
    },
};
