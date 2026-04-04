import { Instructor } from "../../../apiEndPoints";
import { logger } from "../../../utils";
import APIrequest from "../../axios";

export const InstructorServices = {
    getAllInstructors: async (params) => {
        try {
            const payload = {
                ...Instructor.getAllInstructors,
                queryParams: params,
            };
            const res = await APIrequest(payload);
            return res;
        } catch (error) {
            logger(error);
            throw error;
        }
    },
};
