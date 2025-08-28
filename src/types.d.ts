// AIP版本信息，用于存储本地数据和对应版本
// 当版本更新后，用户会收到提示，系统开始清理本地数据，并更新到最新版本
type AIPVersion = {
    name: string,
    cycle: string,
    version_id: number
}