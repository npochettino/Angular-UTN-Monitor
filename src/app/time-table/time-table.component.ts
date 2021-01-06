import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { ApiService } from '../api.service';
import { Horario } from '../horario';

@Component({
  selector: 'app-time-table',
  templateUrl: './time-table.component.html',
  styleUrls: ['./time-table.component.css']
})
export class TimeTableComponent implements OnInit {
  header:any[]=[]
  horarios: Horario[] = []
  timelist:any[]=[]
  serverTime: string
  serverDay: string

  constructor(private apiService:ApiService) { }

  async ngOnInit() {
    this.serverTime = this.apiService.getTime()
    this.serverDay = this.apiService.getDay()

    console.log(this.serverTime)
    this.initializeTime()
    console.log(this.timelist)
    this.header.push("Carrera","Aula", this.timelist[0], this.timelist[1], this.timelist[2], this.timelist[3])
    await this.loadTable()
    setTimeout(() => {
      console.log(this.horarios)
    }, 1000)
  }

  initializeTime(){
    var arr = [], i, j;
    for(i=0; i<24; i++) {
      for(j=0; j<2; j++) {
        arr.push(i + ":" + (j===0 ? "00" : 30*j) );
      }
    }

    var d = new Date(),
    h = d.getHours(),
    m = 30 * Math.floor(d.getMinutes()/30),
    stamp = h + ":" + (m === 0 ? "00" : m);

    var pos = arr.indexOf(stamp)
    this.timelist = arr.slice(pos).concat(arr.slice(0,pos));
  }

  getTime(decimal){
    let hour = +decimal * 24
    let minute = (hour - Math.floor(+decimal * 24)) * 60
    return hour.toString().slice(0,2) + ":" + (minute == 0 ? '00' : minute)
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
        })
      }
      this.horarios = this.horarios.filter(h => h.Dia == this.serverDay)
    };
    req.send();
  }

  getDifference(time1, time2){
    try{
      let [h1, m1] = time1.split(':')
      let [h2, m2] = time2.split(':')

      return ((+h1 + (+m1 / 60)) - (+h2 + (+m2 / 60)))
    }
    catch{}
  }
}
