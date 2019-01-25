import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { PerformanceGraphComponent } from './performance-graph/performance-graph.component';
import { PerformanceGraphIwiComponent } from './performance-graph-iwi/performance-graph-iwi.component';
import { PerformanceGraphClickComponent } from './performance-graph-click/performance-graph-click.component';

@NgModule({
  declarations: [
    AppComponent,
    PerformanceGraphComponent,
    PerformanceGraphIwiComponent,
    PerformanceGraphClickComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
