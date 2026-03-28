import { RoomImage } from "@/dataHelper/roomImage.dataHelper";
import axiosClient from "./axiosClient";

export const roomImageApi = {
    // get image list by room id
    getByRoomId: (roomId: number): Promise<{ data: RoomImage[] }> =>
        axiosClient.get(`admin/room-images/room/${roomId}`),

    // upload multiple images
    upload: (data: FormData): Promise<{ data: RoomImage[] }> =>
        axiosClient.post("admin/room-images", data, {
            headers: { 'Content-Type': 'multipart/form-data'}
        }),

    // update multiple images type
    updateMultipleTypes: (updates: Array<{ id: number; image_type: number }>): Promise<{ data: RoomImage[] }> =>
        axiosClient.put(`admin/room-images/update-type`, { updates }),

    // update image sort order by swapping two images
    updateSort: (roomId: number, imageIdA: number, imageIdB: number): Promise<{ data: any }> =>
        axiosClient.put(`admin/room-images/${roomId}/update-sort/${imageIdA}/${imageIdB}`),

    // delete multiple images
    deleteMultiple: (ids: number[]): Promise<void> =>
        axiosClient.delete(`admin/room-images`, { data: { ids } }),
}