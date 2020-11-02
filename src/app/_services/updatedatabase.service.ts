import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { User } from '@app/_models';

@Injectable({ providedIn: 'root' })
export class UpdationService {

    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
    
    }

    updateStatus(id: string, voteStatus: boolean, votedFor: string) {
        return this.http.post<any>(`${environment.apiUrl}/users/update`, { id, voteStatus, votedFor }).pipe(first()).subscribe(res => {
        });
    }
}

