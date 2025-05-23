import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss',

})
export class AppComponent {
  title = 'NailsTcsoftFE';
}
