import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
  // OJO: elimina "standalone: true" y "imports: [...]" si los tienes
})
export class AppComponent {
  title = 'activa-sports';
   isAuthenticated = false;
  isSplashRoute = false;
  constructor(private router: Router, private authService: AuthService) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const currentUrl = this.router.url;
      this.isSplashRoute = currentUrl.includes('/splash');
      this.isAuthenticated = this.authService.isLoggedIn();
    });
  }
}
