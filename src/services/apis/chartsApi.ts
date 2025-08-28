import axiosInstance from "@/configs/apis/axios";
import apiUrl from "@/configs/apis/apiUrl";

const getAIPVersion = async (): Promise<AIPVersion> => {
    const res = await axiosInstance.get(apiUrl.aip_version)
    return res.data
}

export { getAIPVersion }


// 根据AIP的json数据来分别获取
 
const getOfficialAD = async (): Promise<OfficialAD[]> => {
    return axiosInstance.get(apiUrl.official.adConfig)
}

const getOfficialENR = async (): Promise<OfficialENR[]> => {
    return axiosInstance.get(apiUrl.official.enrouteConfig)
}

const getOfficialAMDT = async (): Promise<OfficialAMDT[]> => {
    return axiosInstance.get(apiUrl.official.amdtConfig)
}

const getOfficialSUP = async (): Promise<OfficialSUP[]> => {
    return axiosInstance.get(apiUrl.official.supConfig)
}

const getOfficialNOTAM = async (): Promise<OfficialNOTAM[]> => {
    return axiosInstance.get(apiUrl.official.notamConfig)
}

export { getOfficialAD, getOfficialENR, 
    getOfficialAMDT, getOfficialSUP, 
    getOfficialNOTAM 
}