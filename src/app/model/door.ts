export interface Door {
    id?: string,
    name: string,
    sensor_auth: string,
    status: string,
    closedDatetime?: Date,
    guards?: any[]
}