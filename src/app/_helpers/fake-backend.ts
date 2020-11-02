import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';

import { User } from '@app/_models';
import { Nominee } from '@app/_models';

let users: User[] = [{ id: '111', firstName: 'Kalpana', lastName: 'Sharma', wardNum: 'Ward 90', voteStatus: false }, 
                        { id: '222', firstName: 'Sanjana', lastName: 'Sagi', wardNum: 'Ward 50', voteStatus: false },
                        { id: '333', firstName: 'Veda', lastName: 'Vikash', wardNum: 'Ward 90', voteStatus: false },
                        { id: '444', firstName: 'Arun', lastName: 'Kumar', wardNum: 'Ward 50', voteStatus: false },
                        { id: '555', firstName: 'Kapil', lastName: 'Kushwaha', wardNum: 'Ward 11', voteStatus: false },
                        { id: '666', firstName: 'Prajwal', lastName: 'Murthy', wardNum: 'Ward 20', voteStatus: false },
                        { id: '777', firstName: 'Prashant', lastName: 'Sharma', wardNum: 'Ward 66', voteStatus: false },
                        { id: '888', firstName: 'Sandeep', lastName: 'Kumar', wardNum: 'Ward 25', voteStatus: false },
                        { id: '999', firstName: 'Anuj', lastName: 'Singh', wardNum: 'Ward 1', voteStatus: false }];

const nominees: Nominee[] = [{id: '01', firstName: 'Nominee', lastName: '1', partyName: 'Party 1', wardNumber: 'Ward 90', constituency: 'Constituency 1', state: 'Tamil Nadu', year: '2020'},
                            {id: '02', firstName: 'Nominee', lastName: '2', partyName: 'Party 2', wardNumber: 'Ward 90', constituency: 'Constituency 1', state: 'Tamil Nadu', year: '2020'},
                            {id: '03', firstName: 'Nominee', lastName: '3', partyName: 'Party 2', wardNumber: 'Ward 50', constituency: 'Constituency 1', state: 'Tamil Nadu', year: '2020'},
                            {id: '04', firstName: 'Nominee', lastName: '4', partyName: 'Party 1', wardNumber: 'Ward 50', constituency: 'Constituency 1', state: 'Tamil Nadu', year: '2020'},
                            {id: '05', firstName: 'Nominee', lastName: '5', partyName: 'Party 1', wardNumber: 'Ward 20', constituency: 'Constituency 1', state: 'Tamil Nadu', year: '2020'},
                            {id: '06', firstName: 'Nominee', lastName: '6', partyName: 'Party 2', wardNumber: 'Ward 25', constituency: 'Constituency 2', state: 'Karnataka', year: '2020'},
                            {id: '07', firstName: 'Nominee', lastName: '7', partyName: 'Party 2', wardNumber: 'Ward 25', constituency: 'Constituency 2', state: 'Karnataka', year: '2020'},
                            {id: '08', firstName: 'Nominee', lastName: '8', partyName: 'Party 1', wardNumber: 'Ward 66', constituency: 'Constituency 2', state: 'Karnataka', year: '2020'},
                            {id: '09', firstName: 'Nominee', lastName: '9', partyName: 'Party 2', wardNumber: 'Ward 11', constituency: 'Constituency 2', state: 'Karnataka', year: '2020'}]
let currentUser;

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url, method, headers, body } = request;

        // wrap in delayed observable to simulate server api call
        return of(null)
            .pipe(mergeMap(handleRoute))
            .pipe(materialize()) // call materialize and dematerialize to ensure delay even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648)
            .pipe(delay(500))
            .pipe(dematerialize());

        function handleRoute() {
            switch (true) {
                case url.endsWith('/users/authenticate') && method === 'POST':
                    return authenticate();
                case url.endsWith('/users') && method === 'GET':
                    return getUsers();
                case url.endsWith('/nominees'):
                    return getNominees();
                case url.endsWith('/users/update'):
                    return setVoteStatus();
                default:
                    // pass through any requests not handled above
                    return next.handle(request);
            }    
        }

        // route functions

        function authenticate() {
            var { firstName, lastName, id } = body;
            var user = users.find(x => x.firstName === firstName && x.lastName === lastName && x.id === id);
            currentUser = user;
            if (!user) return error('User credentials are incorrect');
            //if (user.voteStatus != false) return error('Vote has been casted');
            return ok({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                voteStatus: user.voteStatus
            })
        }

        

        function getUsers() {
            //if (!isLoggedIn()) return unauthorized();
            return ok(users);
        }

        function setVoteStatus() {
            var { id, voteStatus, votedFor } = body;
            for(var i=0; i<users.length; i++){
                if(users[i].id == id){
                    users[i].voteStatus = voteStatus;
                    users[i].votedFor = votedFor;
                    /*return ok({
                        id: users[i].id,
                        firstName: users[i].firstName,
                        lastName: users[i].lastName,
                        voteStatus: users[i].voteStatus,
                        votedFor: users[i].votedFor
                    })*/
                    return ok();
                } 
            }
        }

        // helper functions

        function ok(body?) {
            return of(new HttpResponse({ status: 200, body }))
        }

        function error(message) {
            return throwError({ error: { message } });
        }

        function unauthorized() {
            return throwError({ status: 401, error: { message: 'Unauthorised' } });
        }

        /*function isLoggedIn() {
            return headers.get('Authorization') === `Basic ${window.btoa('Test:User:123')}`;
        }*/

        function getNominees() {
            var currentNominees = [];
            for (var i = 0; i<nominees.length; i++){
                if(currentUser.wardNum === nominees[i].wardNumber)
                    currentNominees.push(nominees[i]);
            }
            if(currentNominees.length <= 0)
                currentNominees = null;
            return ok(currentNominees);
        }
    }
}

export let fakeBackendProvider = {
    // use fake backend in place of Http service for backend-less development
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};