import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-networkerror',
  templateUrl: './networkerror.component.html',
  styleUrls: ['./networkerror.component.scss'],
})
export class NetworkerrorComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {}

  fnReload() {
      this.router.navigate(['login']);
  }
}
