import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { map, toArray } from 'rxjs/operators';
export interface Firmware {
    version: number;
}

@Injectable({
  providedIn: 'root'
})
export class OTAService {
  
  constructor(private http: HttpClient) { 
  }
  
  getFirmwareVersion(sensorAuth): Promise<any> {
    return (
        this.http.get<Firmware>(`http://blynk-cloud.com/${sensorAuth}/get/V4`)
            .pipe(
                map((v: any) => {
                    return (<Firmware>{ version: v });
                })
            )
            .toPromise()
    )
  }

  flashDevice(sensorAuth, flag): Promise<any> {
    return (
        this.http.get<Firmware>(`http://blynk-cloud.com/${sensorAuth}/update/V0?value=${flag}`)
            .toPromise()
    )
  }
}
