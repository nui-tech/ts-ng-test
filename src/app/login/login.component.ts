import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private service: AuthService,
    private router: Router
  ) { }

  signInForm = this.formBuilder.group({
    email: 'nui@truescape.test',
    password: 'password'
  });

  ngOnInit(): void {
  }

  onSubmit() {
    // For simplicity, I ignore null checks here.
    this.service.login(this.signInForm.value.email!, this.signInForm.value.password!).then(() => {
      this.router.navigate(['/home']);
    });
  }

}
