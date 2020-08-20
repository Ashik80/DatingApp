import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from '../_models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  baseUrl = environment.apiUrl + '/auth/';
  helper = new JwtHelperService();
  decodedToken: any;
  currentUser: User;
  photoUrl = new BehaviorSubject<string>('../../assets/user.png');
  currentPhotoUrl = this.photoUrl.asObservable();

  constructor(private http: HttpClient) { }

  changeMemberPhoto(photoUrl: string): void {
    this.photoUrl.next(photoUrl);
  }

  login(model: any): Observable<void> {
    return this.http.post(this.baseUrl + 'login', model).pipe(
      map((response: any) => {
        const user = response;
        if (user) {
          localStorage.setItem('token', user.token);
          localStorage.setItem('user', JSON.stringify(response.userToReturn));
          this.decodedToken = this.helper.decodeToken(user.token);
          this.currentUser = response.userToReturn;
          this.changeMemberPhoto(this.currentUser.photoUrl);
        }
      })
    );
  }

  register(model: any): Observable<object> {
    return this.http.post(this.baseUrl + 'register', model);
  }

  loggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !this.helper.isTokenExpired(token);
  }

}
