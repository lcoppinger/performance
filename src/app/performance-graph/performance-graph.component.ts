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
  active: string = "Measured";
  strategy: any = {name:'Measured', risk:'Medium risk'};
  strategies: any[] = [{name:'Defensive', risk:'Low risk'}, {name:'Cautious', risk:'Low/Medium risk'}, {name:'Measured', risk:'Medium risk'}, {name:'Adventurous', risk:'Medium/High risk'}, {name:'Aggressive', risk:'High risk'}]; 
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
    if (strategy.name !== this.active) {
      this.active = strategy.name;
      this.strategy = strategy;
    }
  }

  getImage(strategy) {
    const name = strategy.name.toLowerCase();
    return strategy.name===this.active ? "assets/imgs/"+name+"-tab-active.svg" : "assets/imgs/"+name+"-tab-icon.svg";
  }
}
