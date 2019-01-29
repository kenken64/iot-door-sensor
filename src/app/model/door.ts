export interface Door {
  id?: string;
  name: string;
  sensor_auth: string;
  status: string;
  prev_status?: string;
  closedDatetime?: Date;
  guards?: any[];
  battery?: string;
}
