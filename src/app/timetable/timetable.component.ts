import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../api.service';
import { Horario } from '../horario';
import { Renderer } from './renderer';
import { Timetable } from './timetable';
import { Scope } from './_models/scope';
import * as XLSX from 'xlsx';
import { Utils } from '../utils';

@Component({
  selector: 'app-timetable',
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.css']
})
export class TimetableComponent implements OnInit {
  horarios: Horario[] = []
  serverDay: string
  serverDate: Date

  screenHeight: number;
  screenWidth: number;

  @ViewChild('timetable') element: ElementRef;
  selector;
  timetable: Timetable;
  renderer: Renderer;
  scope: Scope;
  locations = [];
  events = [];
  aulas = []

  @HostListener('window:resize', ['$event'])
    getScreenSize(event?) {
        this.screenHeight = window.innerHeight;
        this.screenWidth = window.innerWidth;
    }

  constructor(
    private apiService: ApiService) {
      this.getScreenSize();
    }

  async ngOnInit() {
    this.serverDay = this.apiService.getDay()
    this.serverDate = this.apiService.serverDate()
    await this.loadTable()
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
        this.horarios = Object.assign([], arraylist);
        this.horarios.forEach(h => {
          h.HoraDesde = Number(h.Desde.split(':')[0])
          h.MinutoDesde = Number(h.Desde.split(':')[1])
          h.HoraHasta = Number(h.Hasta.split(':')[0])
          h.MinutoHasta = Number(h.Hasta.split(':')[1])
          if(h.Fecha)
            h.Fecha = this.excelDateToJSDate(h.Fecha);

          if(!this.aulas)
            this.aulas = []

          if(h.Dia == this.serverDay || h.Fecha == Utils.normalizeDate(this.serverDate))
            this.aulas.push(h.Carrera + " - " + h.Aula)
        })
      }

      console.log(Utils.normalizeDate(this.serverDate))
      console.log(this.horarios.filter(h => h.Fecha == Utils.normalizeDate(this.serverDate)))

      this.horarios = this.horarios.filter(h => h.Dia == this.serverDay || h.Fecha == Utils.normalizeDate(this.serverDate))
      this.aulas = this.aulas.map(item => item).filter((value, index, self) => self.indexOf(value) === index).sort()
    };
    req.send();
  }

  ngAfterViewInit() {
    this.selector =  this.element.nativeElement;
    setTimeout(() => {
      this.addTimeTable();
    }, 1000);

    setInterval(() => {
      this.selector =  this.element.nativeElement;
      this.loadTable()
      this.addTimeTable();
    }, 1000 * 60);
  }

  async addTimeTable() {
    this.timetable = new Timetable();

    let currentHour = Number(this.apiService.getTime()) - 1

    let end = currentHour + 7 > 23 ? currentHour + 7 - 23 : currentHour + 7
    if(this.screenWidth > 1150)
      end = currentHour + 8 > 23 ? currentHour + 8 - 23 : currentHour + 8

    this.timetable.setScope(currentHour, end);

    this.timetable.addLocations(this.aulas);

    this.horarios.forEach(h => {
      this.timetable.addEvent(`${h.Materia} - ${h.Profesor}`,
      h.Carrera + " - " + h.Aula,
        new Date(this.serverDate.getFullYear(), this.serverDate.getMonth(), this.serverDate.getDate(), h.HoraDesde, h.MinutoDesde),
        new Date(this.serverDate.getFullYear(), this.serverDate.getMonth(), this.serverDate.getDate(), h.HoraHasta, h.MinutoHasta),
        { url: '#' });
    })

    this.renderer = new Renderer(this.timetable);
    this.renderer.emptyNode(this.selector);
    this.renderer.draw(this.selector);
  }

  excelDateToJSDate(serial) {
    // https://stackoverflow.com/questions/16229494/converting-excel-date-serial-number-to-date-using-javascript
    return Utils.normalizeDate(new Date(Date.UTC(0, 0, serial, -4)));
 }
}
