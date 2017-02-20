import { Component } from '@angular/core';
import { Auth } from './auth.service';

@Component({
  selector: 'login',
  templateUrl: `./login.component.html`,
  providers: [Auth],
})

export class LoginComponent {
  constructor(private auth: Auth) { }
}
