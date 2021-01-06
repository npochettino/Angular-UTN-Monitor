import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private endpoint: string = `https://www.frrq.utn.edu.ar/wp-json/wp/v2/posts`;

  constructor(private http: HttpClient) { }

  async getPost(): Promise<any[]> {
    try {
      return await this.http.get<any[]>(`${this.endpoint}`).toPromise();
    } catch (err) {
      console.error(err);
    }
  }

  public getTime(): string {
    try {
      return new Date().getHours().toString();
    } catch (err) {
      console.error(err);
    }
    return null;
  }

  public serverDate(): Date {
    try {
      return new Date();
    } catch (err) {
      console.error(err);
    }
    return null;
  }

  public getDay(): string {
    try {
      var d = new Date()
      var day = d.getDay()
      switch (day) {
        case 0:
          return "Domingo"
        case 1:
          return "Lunes"
        case 2:
          return "Martes"
        case 3:
          return "Miercoles"
        case 4:
          return "Jueves"
        case 5:
          return "Viernes"
        case 6:
          return "Sabado"
        default:
          break;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  }
}
