import { AlertifyService } from './../_services/alertify.service';
import { AuthService } from './../_services/auth.service';
import { Component, OnInit } from '@angular/core';
import { faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  model: any = {};
  faUser = faUser;
  faSignOutAlt = faSignOutAlt;

  constructor(public authService: AuthService, private alertify: AlertifyService) { }

  ngOnInit(): void {
  }

  login(): void {
    this.authService.login(this.model).subscribe(next => {
      this.alertify.success('Logged in successfully');
    }, error => this.alertify.error(error));
  }

  loggedIn(): boolean {
    return this.authService.loggedIn();
  }

  logout(): void {
    localStorage.removeItem('token');
    this.alertify.message('Logged out');
  }

}
