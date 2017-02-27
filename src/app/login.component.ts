import { Component } from '@angular/core';
import { Auth } from './auth.service';
import * as $ from 'jquery';

@Component({
  selector: 'login',
  templateUrl: `./login.component.html`,
  styleUrls: ['./app.component.css']
})

export class LoginComponent {
  constructor(private auth: Auth) { }

  ngOnInit() {
    this.setBackground();

    $(window).on("resize", () => {
      this.setBackground();
    }).resize();
  }

  setBackground() {
    const width = $(window).width();
    const height = $(window).height();

    let styles = {
      'background-image': 'url("assets/img/BG-login.png")',
      'background-repeat': 'repeat',
      'height': height + 'px',
      'width': width + 'px',
    };
    return styles;
  }
}
