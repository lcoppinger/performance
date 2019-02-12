import { Component, OnInit } from '@angular/core';
import { AngularWaitBarrier } from 'blocking-proxy/built/lib/angular_wait_barrier';
import { HttpClient } from '@angular/common/http';
declare var d3: any;

@Component({
  selector: 'app-performance-graph',
  templateUrl: './performance-graph.component.html',
  styleUrls: ['./performance-graph.component.scss']
})
export class PerformanceGraphComponent implements OnInit {
  data: string = "Click";
  selected: string = "Measured";
  strategy: any = {name:'Measured', risk:'medium risk'};
  strategies: any[] = [{name:'Defensive', risk:'lowest risk'}, {name:'Cautious', risk:'second lowest risk'}, {name:'Measured', risk:'medium risk'}, {name:'Adventurous', risk:'second highest risk'}, {name:'Aggressive', risk:'highest risk'}]; 
  constructor(private http: HttpClient) { }

  ngOnInit() {
 
  }

  switchData() {
    window.scrollTo({ 
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
    });
    this.data = this.data === "Click" ? "IWI" : "Click";
  }

  changeStrategy(strategy) {
    if (strategy.name !== this.selected) {
      this.selected = strategy.name;
      this.strategy = strategy;
    }
  }

  getImage(strategy) {
    const name = strategy.name.toLowerCase();
    return strategy.name===this.selected ? "assets/imgs/"+name+"-tab-active.svg" : "assets/imgs/"+name+"-tab-icon.svg";
  }
}
