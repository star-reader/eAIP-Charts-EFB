// AIP版本信息，用于存储本地数据和对应版本
// 当版本更新后，用户会收到提示，系统开始清理本地数据，并更新到最新版本
type AIPVersion = {
    name: string,
    cycle: string,
    version_id: number
}

// 局方的json解析
type OfficialAD = {
    "id": string,
    "pId": string,
    "name": string,
    "airporticao": string,
    "name_cn": string,
    "pdfPath": string,
    "htmlPath": string,
    "htmlEnPath": string,
    "isOpened": boolean,
    "Is_Modified": string
}

type OfficialENR = {
    "id": string,
    "pId": string,
    "name": string,
    "airporticao": string,
    "name_cn": "ENR  第二部分 航路 (ENR)",
    "pdfPath": string,
    "htmlPath": string,
    "htmlEnPath": string,
    "isOpened": boolean,
    "Is_Modified": string
}

type OfficialSUP = {
    "Id": string,
    "Document": string,
    "CHAPTER_TYPE": string,
    "Serial": string,
    "Subject": string,
    "Local_Subject": string,
    "IS_MODIFIED": string,
    "Effective_Time": string,
    "Out_Date": string,
    "Pub_Date": string
}

type OfficialAMDT = {
    "id": string,
    "pId": string,
    "name": string,
    "airporticao": string,
    "name_cn": "ZYJM-4:AOC RWY06/24",
    "pdfPath": string,
    "htmlPath": string,
    "htmlEnPath": string,
    "isOpened": false,
    "Is_Modified": null
}

type OfficialNOTAM = {
    "SeriesName": string,
    "Document": string,
    "GenerateTime": string,
    "GenerateTime_En": string
}

type OfficialAIC = {
    "Id": string,
    "Document": string,
    "CHAPTER_TYPE": string,
    "Serial": string,
    "Subject": string,
    "Local_Subject": string,
    "IS_MODIFIED": string,
    "Effective_Time": string,
    "Out_Date": string,
    "Pub_Date": string
}