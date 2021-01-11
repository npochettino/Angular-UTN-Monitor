import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CarouselComponent } from './carousel/carousel.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TimetableComponent } from './timetable/timetable.component';
import { HttpClient } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { HttpRequestInterceptor } from './http-request-interceptor';

registerLocaleData(localeEs, 'es');

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    CarouselComponent,
    TimetableComponent
  ],
  imports: [
    TranslateModule.forRoot({
      defaultLanguage: 'es',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    BrowserModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (translate: TranslateService) => _ => {
        let lang = localStorage.getItem('lang');
        if (!lang) {
          lang = 'es';
          localStorage.setItem('lang', lang);
        }

        // this language will be used as a fallback when a translation isn't found in the current language
        translate.setDefaultLang('es');

        // the lang to use, if the lang isn't available, it will use the current loader to get them
        return translate.use(lang).toPromise();
      },
      deps: [TranslateService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
