import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Nominee } from '@app/_models';
@Injectable({ providedIn: 'root' })
export class NomineeService {
    
    constructor(private http: HttpClient) {
    }

    getNominees() {
        return this.http.get<Nominee[]>(`${environment.apiUrl}/nominees`);
    }
}