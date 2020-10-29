import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Component } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  error?: string;
  interacting = false;
  formGroup: FormGroup;
  usernameControl = new FormControl("", Validators.required);
  passwordControl = new FormControl("", Validators.required);

  constructor(private httpClient: HttpClient, private fb: FormBuilder) {
    this.formGroup = this.fb.group({
      username: this.usernameControl,
      password: this.passwordControl,
    });
  }

  login(): void {
    if (!this.formGroup.valid) {
      this.error = "Bitte fülle Usernamen und Passwort aus!";
      return;
    }

    this.error = undefined;
    this.interacting = false;

    this.httpClient
      .post("api/interact", {
        username: this.usernameControl.value,
        password: this.passwordControl.value,
      })
      .subscribe({
        next: (res) => {
          console.log("DONE");
          this.interacting = true;
        },
        error: (err: HttpErrorResponse) => {
          this.error = err.error;
        },
      });
  }
}
