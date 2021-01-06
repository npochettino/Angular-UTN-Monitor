import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ApiService } from '../api.service';
import { Post } from '../model/post';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit {
  _posts: Post[] = []

  constructor(private apiService:ApiService) { }

  async ngOnInit() {
    let posts = await this.apiService.getPost()
    posts.forEach(post => {
      const data = new Post()
      data.id = post.id
      data.createdDate = post.date
      data.title = post.title.rendered
      data.imageUrl = this.getImage(post.content.rendered)
      this._posts.push(data)
    });
    //console.log(this._posts)
  }

  private getImage(rendered: string){
    if(rendered.includes('.jpg')){
      let first = rendered.indexOf('https://www.frrq.utn.edu.ar/wp-content/uploads/')
      let result = rendered.substring(first)
      return result.split('.jpg')[0] + '.jpg'
    }
    if(rendered.includes('.jpeg')){
      let first = rendered.indexOf('https://www.frrq.utn.edu.ar/wp-content/uploads/')
      let result = rendered.substring(first)
      return result.split('.jpeg')[0] + '.jpeg'
    }
    if(rendered.includes('.png')){
      let first = rendered.indexOf('https://www.frrq.utn.edu.ar/wp-content/uploads/')
      let result = rendered.substring(first)
      return result.split('.png')[0] + '.png'
    }
    else
      return 'https://www.frrq.utn.edu.ar/wp-content/uploads/2020/02/ImgLogoUTN.png'
  }
}
