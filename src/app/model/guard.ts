export interface Guard {
    name: string,
    email: string,
    mobileNo: string
}

export interface GuardId extends Guard { id?: string; }
