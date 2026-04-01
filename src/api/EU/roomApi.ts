import axiosClient from "@/api/axiosClient";
import { Room } from "@/dataHelper/EU/room.dataHelper";
import { AxiosResponse } from "axios";

export interface PublicRoomListParams {
    partner_id?: number;
    province_id?: number;
    page?: number;
    per_page?: number;
}

export const roomApi = {
    getRoomList: (params: PublicRoomListParams = {}): Promise<AxiosResponse<Room[]>> => {
        return axiosClient.get<Room[]>("rooms/search", { params });
    },

    getRoomDetail: (id: number): Promise<AxiosResponse<any>> => {
        return axiosClient.get(`rooms/${id}`);
    },
}