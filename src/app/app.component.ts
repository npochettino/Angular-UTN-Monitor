import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ApiService } from './api.service';
import { Horario } from './horario';
import * as XLSX from 'xlsx';

import { Renderer } from './timetable/renderer';
import { Timetable } from './timetable/timetable';
import { Scope } from './timetable/_models/scope';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  horarios: Horario[] = []
  serverDay: string
  public now: Date = new Date();

  @ViewChild('timetable') element: ElementRef;
  selector;
  timetable: Timetable;
  renderer: Renderer;
  scope: Scope;
  locations = [];
  events = [];
  aulas = []

  constructor(
    private apiService:ApiService) {
      setInterval(() => {
        this.now = new Date();
      }, 1);
      this.timetable = new Timetable();
    }

  async ngOnInit() {
    this.serverDay = this.apiService.getDay()
    await this.loadTable()
    setInterval(this.loadTable, 1000 * 60)
  }

  async loadTable(){
    let url = "/assets/hours/UTN.xlsx";
    let req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.responseType = "arraybuffer";
    req.onload = (e) => {
      let data = new Uint8Array(req.response);
      var arr = new Array();
      for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
      var bstr = arr.join("");
      var workbook = XLSX.read(bstr, {type:"binary"});
      var first_sheet_name = workbook.SheetNames[0];
      var worksheet = workbook.Sheets[first_sheet_name];
      var arraylist = XLSX.utils.sheet_to_json(worksheet,{raw:true});
      if(arraylist){
        //Object.assign(this.horarios, arraylist)
        this.horarios = Object.assign([], arraylist);
        this.horarios.forEach(h => {
          h.HoraDesde = Number(h.Desde.split(':')[0])
          h.MinutoDesde = Number(h.Desde.split(':')[1])
          h.HoraHasta = Number(h.Hasta.split(':')[0])
          h.MinutoHasta = Number(h.Hasta.split(':')[1])
          if(!this.aulas)
            this.aulas = []

          this.aulas.push(h.Carrera + " - " + h.Aula)
        })
      }
      this.horarios = this.horarios.filter(h => h.Dia == this.serverDay)
      this.aulas = this.aulas.map(item => item).filter((value, index, self) => self.indexOf(value) === index).sort()
    };
    req.send();
    if(this.selector)
      this.addTimeTable()
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.selector =  this.element.nativeElement;
      this.addTimeTable();
    }, 1000);
  }

  addTimeTable() {
    let serverDate = this.apiService.serverDate()

    let currentHour = Number(this.apiService.getTime())
    this.timetable.setScope(currentHour, currentHour + 7);

    this.timetable.addLocations(this.aulas);

    this.horarios.forEach(h => {
      this.timetable.addEvent(`${h.Materia} - ${h.Profesor}`,
      h.Carrera + " - " + h.Aula,
        new Date(serverDate.getFullYear(), serverDate.getMonth(), serverDate.getDate(), h.HoraDesde, h.MinutoDesde),
        new Date(serverDate.getFullYear(), serverDate.getMonth(), serverDate.getDate(), h.HoraHasta, h.MinutoHasta),
        { url: '#' });
    })

    this.renderer = new Renderer(this.timetable);
    this.renderer.draw(this.selector);
  }
}
