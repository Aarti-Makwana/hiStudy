import { UserOrder } from "../../../apiEndPoints";
import { logger } from "../../../utils";
import APIrequest from "../../axios";

export const UserOrderServices = {
    placeOrder: async (payload) => {
        try {
            const config = {
                ...UserOrder.placeOrder,
            };

            const res = await APIrequest({
                ...config,
                bodyData: payload,
            });
            return res;
        } catch (error) {
            logger(error);
            throw error;
        }
    },
    applyCoupon: async (payload) => {
        try {
            const config = {
                ...UserOrder.applyCoupon,
            };

            const res = await APIrequest({
                ...config,
                bodyData: payload,
            });
            return res;
        } catch (error) {
            logger(error);
            throw error;
        }
    },
};
