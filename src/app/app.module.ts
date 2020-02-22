import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component';
import { DynamicFieldComponent } from './dynamic-form/dynamic-field/dynamic-field.component';
import { DynamicFormWrapperComponent } from './dynamic-form-wrapper/dynamic-form-wrapper.component';

@NgModule({
  declarations: [
    AppComponent,
    DynamicFormComponent,
    DynamicFieldComponent,
    DynamicFormWrapperComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
