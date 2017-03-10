import { Injectable } from '@angular/core';
import { tokenNotExpired } from 'angular2-jwt';

// Avoid name not found warnings
declare var Auth0Lock: any;

@Injectable()
export class Auth {
  // Configure Auth0
  lock = new Auth0Lock('8nQSMTElq7vxylFZgRfia2EIwka8f6sA', 'ingarage.au.auth0.com', {
    // theme: {
    //   logo: "test-icon.png",
    //   primaryColor: "#b81b1c"
    // },
    languageDictionary: {
      title: "Maker PlayGround"
    }
  });

  constructor() {
    // Add callback for lock `authenticated` event
    this.lock.on("authenticated", (authResult) => {
      localStorage.setItem('id_token', authResult.idToken);

      this.lock.getProfile(authResult.idToken, (error: any, profile: any) => {
        if (error) {
          console.log(error);
        }

        console.log('profile', profile);
        localStorage.setItem('profile', JSON.stringify(profile));
      });

      this.lock.hide();
    });
  }

  public login() {
    // Call the show method to display the widget.
    this.lock.show();
  }

  public authenticated() {
    // Check if there's an unexpired JWT
    // This searches for an item in localStorage with key == 'id_token'
    return tokenNotExpired();
  }

  public logout() {
    // Remove token and profile from localStorage
    localStorage.removeItem('profile');
    localStorage.removeItem('id_token');
  }
}