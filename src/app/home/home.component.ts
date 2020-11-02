import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { Nominee } from '@app/_models';
import { NomineeService } from '@app/_services';
import { AuthenticationService } from '@app/_services';
import { UpdationService } from '@app/_services';

@Component({ templateUrl: 'home.component.html' })
export class HomeComponent {
    loading = false;
    //users: User[];
    nominees: Nominee[];
    currentUser;
    constructor(private router: Router, private nomineeService: NomineeService, private authenticationService: AuthenticationService, private updatedatabaseService: UpdationService) { }
    ngOnInit() {
        this.loading = true;
        this.currentUser = this.authenticationService.currentUserValue;
        if(this.currentUser.voteStatus === true) {
            this.router.navigate(['/voted']);
        } else {
            this.nomineeService.getNominees().pipe(first()).subscribe(nominees => {
                this.loading = false;
                this.nominees = nominees;
            });
        }
    }

    voteIn(user, nominee) {
        user.voteStatus = true;
        user.votedFor = nominee.id;
        this.updatedatabaseService.updateStatus(user.id, user.voteStatus, user.votedFor);
        this.router.navigate(['/thankyou']);
    }
}