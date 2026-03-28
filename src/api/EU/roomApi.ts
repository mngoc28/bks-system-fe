import axiosClient from "@/api/axiosClient";
import { Room } from "@/dataHelper/EU/room.dataHelper";
import { AxiosResponse } from "axios";

export const roomApi = {
    getRoomList: (partner_id?: number): Promise<AxiosResponse<Room[]>> => {
        const params = partner_id ? { partner_id } : {};
        return axiosClient.get<Room[]>("rooms/search", { params });
    },

    getRoomDetail: (id: number): Promise<AxiosResponse<any>> => {
        return axiosClient.get(`rooms/${id}`);
    },
}