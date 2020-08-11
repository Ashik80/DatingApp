import { faUser, faHeart, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { User } from './../../_models/user';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.css']
})
export class MemberCardComponent implements OnInit {
  @Input() user: User;
  faUser = faUser;
  faHeart = faHeart;
  faEnvelope = faEnvelope;

  constructor() { }

  ngOnInit(): void {
  }

}
