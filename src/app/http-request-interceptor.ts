import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../environments/environment';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {

  constructor(
    private translateService: TranslateService
  ) {

  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let lang = this.translateService.currentLang;
    if (!lang) {
      lang = localStorage.getItem('lang');
    }

    if (!lang) {
      lang = 'es';
    }

    // Clone the request to add the new header and options
    const clonedRequest = request.clone({
      headers: request.headers.set('Accept-Language', `${lang}-US`),
      withCredentials: !environment.production
    });

    // Pass the cloned request instead of the original request to the next handle
    return next.handle(clonedRequest);
  }
}
