import { Component, OnInit, Output, EventEmitter, HostListener, Input  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
declare var d3: any;

@Component({
  selector: 'app-performance-graph-click',
  templateUrl: './performance-graph-click.component.html',
  styleUrls: ['./performance-graph-click.component.scss','../performance-graph/performance-graph.component.scss']
})
export class PerformanceGraphClickComponent {
  @Input() strategy;
  @Output() switch: EventEmitter<any> = new EventEmitter();
  tableData: any;
  valueIncrease: any;
  percentageIncrease: any;
  intialInvestment: any;
  expanded: boolean = false;
  modal: boolean = false;
  error: string = null;

  constructor(private http: HttpClient) { }
  @HostListener('window:resize')
  onResize() {
    const svg = d3.select('#chart svg');
    svg.remove();
    this.drawGraph();
  }

  ngOnChanges() {
    if (d3.select('#chart svg')) {
      d3.select('#chart svg').remove();
    }
    this.intialInvestment = 10000;
    this.drawGraph();
    this.makeTable();
  }

  makeTable() {
    this.http.get("assets/json/click-"+this.strategy.name.toLowerCase()+"-quarterly.json").subscribe((data: any) => {
      this.tableData = data;
    });
  }

  toggleTable() {
    this.expanded = !this.expanded;
  }

  toggleModal() {
    this.modal = !this.modal;
  }

  switchData() {
    this.switch.emit("IWI");
  }

  drawGraph() {
    var aspect = 960 / 500;
    var chartDiv = document.getElementById("chart");
    chartDiv.style.height = chartDiv.clientWidth / aspect + 'px';
    var svgWidth = chartDiv.clientWidth;
    var svgHeight = chartDiv.clientHeight;
    var svg = d3.select(chartDiv).append("svg")
    .attr('width', svgWidth)
    .attr('height', svgHeight)
    .attr('id', 'Click')
    .attr('class', 'graph-svg');

    if (window.innerWidth < 768) {
      var margin = {top: 20, right: 48, bottom: 30, left: 10};
    } else {
      var margin = {top: 20, right: 60, bottom: 30, left: 20};
    }

    var width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;
    let parseTime = d3.timeParse("%b %Y"),
    bisectDate = d3.bisector(function(d) { return d.date; }).left;
    let self = this;

    var focus;

    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    var line = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.clickValue); });

    var lineArc = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.arcValue); }); 

    var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // for animated area
    var initialarea = d3.area()
    .x(function(d) { return x(d.date); })
    .y0(height)
    .y1(height);

    // define the area
    let area = d3.area()
    .x(function(d) { return x(d.date); })
    .y0(height)
    .y1(function(d) { return y(d.click); });

    d3.select("#currency-field").on("change", refresh);

    // gridlines in y axis function
    function make_y_gridlines() {		
      return d3.axisLeft(y)
          .ticks(5)
    }

    // Animate line
    function transition(path) {
      path.transition()
          .duration(2000)
          .attrTween("stroke-dasharray", tweenDash);
    }

    function tweenDash() {
        let l = this.getTotalLength(),
            i = d3.interpolateString("0," + l, l + "," + l);
        return function (t) { return i(t); };
    }

    function dashedTransition(path) {
      let totalLength = path.node().getTotalLength();
      let dashing = "6, 6";

      let dashLength =
      dashing
          .split(/[\s,]/)
          .map(function (a) { return parseFloat(a) || 0 })
          .reduce(function (a, b) { return a + b });

      let dashCount = Math.ceil( totalLength / dashLength );
      let newDashes = new Array(dashCount).join( dashing + " " );
      let dashArray = newDashes + " 0, " + totalLength;
      path
      .attr("stroke-dashoffset", totalLength)
      .attr("stroke-dasharray", dashArray)
      .transition().duration(2000)
      .attr("stroke-dashoffset", 0);
    }

    // Create the svg:defs element and the main gradient definition.
    var svgDefs = svg.append('defs');

    var mainGradientClick = svgDefs.append('linearGradient')
        .attr('id', 'mainGradientClick')
        .attr("x1", "0%")
        .attr("x2", "50%")
        .attr("y1", "0%")
        .attr("y2", "100%");

    // Create the stops of the main gradient. Each stop will be assigned
    // a class to style the stop using CSS.
    mainGradientClick.append('stop')
        .attr('class', 'stop-left')
        .attr('offset', '0%');

    mainGradientClick.append('stop')
        .attr('class', 'stop-right')
        .attr('offset', '100%');

    d3.json("assets/json/click-"+this.strategy.name.toLowerCase()+".json", function(error, data) {
      if (error) throw error;

      calculateData(data);
      const every_nth = (arr, nth) => arr.filter((e, i) => i % nth === nth - 1);

      if (window.innerWidth < 768) {
        data = every_nth(data, 4);
      }

      data.forEach(function(d) {
        d.date = parseTime(d.date);
        d.click = +d.clickValue;
        d.arc = +d.arcValue;
      });

      x.domain(d3.extent(data, function(d) { return d.date; }));
      y.domain([d3.min(data, function(d) { return Math.min(d.arc, d.click); }) / 1.005, d3.max(data, function(d) { return Math.max(d.arc, d.click); }) * 1.005]);
      
      var xScale = x.copy();
      if (window.innerWidth < 768) {
        var xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b %Y")).ticks(4);
      } else {
        // var xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b %Y")).ticks(d3.timeMonth.every(1));
        var xAxis = d3.axisBottom(xScale).tickFormat(function(d,i) {
          if (i === 0 && d === 'Tue Dec 01 2015 00:00:00 GMT+0000 (Greenwich Mean Time)') {
            return 'Inception';
          } else {
            const formatTime = d3.timeFormat("%b %Y"); 
            return formatTime(d);
          }
        });
      }

      line = d3.line()
      .x(function(d) { return xScale(d.date); })
      .y(function(d) { return y(d.clickValue); });

      var xAxisG = g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      g.append("g")
      .attr("class", "axis axis--y")
      .attr("transform", "translate( " + width + ", 0 )")
      .call(d3.axisRight(y).ticks(5).tickFormat(function(d) { 
        if (d > 999 && d < 999999) {
          return "£" + d/1000 + "k"; 
        } else if (d > 999999) {
          return "£" + d/1000000 + "m"; 
        } else {
          return "£" + d;
        }
      }))
      .append("text")
      .attr("class", "axis-title")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .attr("fill", "#5D6971");

      g.append("g")			
      .attr("class", "grid")
      .call(make_y_gridlines()
          .tickSize(-width)
          .tickFormat("")
      )

      // add the area
      g.append("path")
      .data([data])
      .attr("class", "area")
      .attr("d", initialarea) // initial state (line at the bottom)
      .transition().duration(1500)
      .attr("d", area);

      g.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line)
        .call(transition);

      g.append("path")
        .datum(data)
        .attr("class", "lineArc")
        .attr("d", lineArc)
        .call(dashedTransition);

      g.selectAll(".circle")
        .data(data)
        .enter().append("circle")
        .attr("class", "circle")
        .attr("r", 5)
        .attr("cx", function(d) {
          return x(d.date)
        })
        .attr("cy", function(d) {
          return y(d.click)
        });

      focus = g.append("g")
      .attr("class", "focus")
      .style("display", "none"); 
      
      focus.append("line")
        .attr("class", "x-hover-line hover-line")
        .attr("y1", 0)
        .attr("y2", height);

      focus.append("circle")
          .attr("r", 7.5);

      focus.append("foreignObject")
          .attr("x", 15)
          .attr("dy", ".31em")
          .attr("class", "tooltip")
          .attr("width", 250)
          .attr("height", 100)
          .append('xhtml:div')
          .append('div')
          .attr("class", "tooltip-inner");

      svg.append("rect")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
          .attr("class", "overlay")
          .attr("width", width)
          .attr("height", height)
          .on("mouseover", function() { focus.style("display", null); })
          .on("mouseout", function() { focus.style("display", "none"); })
          .on("mousemove", mousemove);

      function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;
        let position = d3.mouse(this)[0];
        focus.attr("transform", "translate(" + x(d.date) + "," + y(d.click) + ")");
        if (formatDate(d.date) === 'Dec 2015') {
          focus.select(".tooltip-inner").html(function() { return "<span>Click&nbsp;&&nbsp;Invest:&nbsp;£" + d.click.toLocaleString('en', {minimumFractionDigits: 2}).replace(/\B(?=(\d{3})+(?!\d))/g, ",") 
          + "</span><br><span>Peers:&nbsp;£" + d.arc.toLocaleString('en', {minimumFractionDigits: 2}).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "</span><br><span class='date'>Inception</span>"; });
        } else {
          focus.select(".tooltip-inner").html(function() { return "<span>Click&nbsp;&&nbsp;Invest:&nbsp;£" + d.click.toLocaleString('en', {minimumFractionDigits: 2}).replace(/\B(?=(\d{3})+(?!\d))/g, ",") 
          + "</span><br><span>Peers:&nbsp;£" + d.arc.toLocaleString('en', {minimumFractionDigits: 2}).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "</span><br><span class='date'>Date:&nbsp;" +
          formatDate(d.date) + "</span>"; });
        }
        
        focus.select(".x-hover-line").attr("y2", height - y(d.click));
        let boxWidth = focus.select(".tooltip-inner").node().getBoundingClientRect();
        focus.select("foreignObject").attr("x", function() {
          return position > (width/1.75) ? -(boxWidth.width + 10) : 10;
        });
        focus.select("foreignObject").attr("y", function() {
          return position > (height/1.75) ? 10 : -(boxWidth.height + 10);
        });
      }

      // var zoom = d3.zoom()
      //   .scaleExtent([1, 2])
      //   .translateExtent([[0, 0], [width, height]])
      //   .extent([[0, 0], [width, height]])
      //   .on('zoom', zoomed);

      // svg.call(zoom);

      // function zoomed() {
      //   xScale = d3.event.transform.rescaleX(x);
      //   xAxisG.call(xAxis.scale(d3.event.transform.rescaleX(x)));

      //   d3.select('.line').attr('d', line(data));
      //   d3.select('.line').attr('clip-path', 'url(#clip)');
      // }
    });

    function refresh() {
      if (self.intialInvestment >= 2500 && self.intialInvestment <= 10000000) {
        self.error = null;
        d3.json("assets/json/click-"+self.strategy.name.toLowerCase()+".json", function(error, data) {
          calculateData(data);
          const every_nth = (arr, nth) => arr.filter((e, i) => i % nth === nth - 1);

          if (window.innerWidth < 768) {
            data = every_nth(data, 4);
          }

          data.forEach(function(d) {
            d.date = parseTime(d.date);
            d.click = +d.clickValue;
            d.arc = +d.arcValue;
          });

          // Scale the range of the data again 
          x.domain(d3.extent(data, function(d) { return d.date; }));
          y.domain([d3.min(data, function(d) { return Math.min(d.arc, d.click); }) / 1.005, d3.max(data, function(d) { return Math.max(d.arc, d.click); }) * 1.005]);

          d3.select(".area")
            .data([data])
            .attr("d", initialarea) // initial state (line at the bottom)
            .transition().duration(1500)
            .attr("d", area);

          d3.select(".lineArc")
            .call(dashedTransition);
          
          d3.select(".line")
            .call(transition);

          d3.select(".axis--y") // change the x axis
          .transition()
          .duration(750)
          .call(d3.axisRight(y).ticks(5).tickFormat(function(d) { 
            if (d > 999 && d < 999999) {
              return "£" + d/1000 + "k"; 
            } else if (d > 999999) {
              return "£" + d/1000000 + "m"; 
            } else {
              return "£" + d;
            }
          }));

          d3.select(".overlay")
          .on("mousemove", mousemove);

          function mousemove() {
            var x0 = x.invert(d3.mouse(this)[0]),
                i = bisectDate(data, x0, 1),
                d0 = data[i - 1],
                d1 = data[i],
                d = x0 - d0.date > d1.date - x0 ? d1 : d0;
            let position = d3.mouse(this)[0];
            focus.attr("transform", "translate(" + x(d.date) + "," + y(d.click) + ")");
            if (formatDate(d.date) === 'Dec 2015') {
              focus.select(".tooltip-inner").html(function() { return "<span>Click&nbsp;&&nbsp;Invest:&nbsp;£" + d.click.toLocaleString('en', {minimumFractionDigits: 2}).replace(/\B(?=(\d{3})+(?!\d))/g, ",") 
              + "</span><br><span>Peers:&nbsp;£" + d.arc.toLocaleString('en', {minimumFractionDigits: 2}).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "</span><br><span class='date'>Inception</span>"; });
            } else {
              focus.select(".tooltip-inner").html(function() { return "<span>Click&nbsp;&&nbsp;Invest:&nbsp;£" + d.click.toLocaleString('en', {minimumFractionDigits: 2}).replace(/\B(?=(\d{3})+(?!\d))/g, ",") 
              + "</span><br><span>Peers:&nbsp;£" + d.arc.toLocaleString('en', {minimumFractionDigits: 2}).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "</span><br><span class='date'>Date:&nbsp;" +
              formatDate(d.date) + "</span>"; });
            }

            focus.select(".x-hover-line").attr("y2", height - y(d.click));
            let boxWidth = focus.select(".tooltip-inner").node().getBoundingClientRect();
            focus.select("foreignObject").attr("x", function() {
              return position > (width/2) ? -(boxWidth.width + 10) : 10;
            });
            focus.select("foreignObject").attr("y", function() {
              return position > (height/2) ? 10 : -(boxWidth.height + 10);
            });
          }
        });
      } else if (self.intialInvestment < 2500) {
        self.error = "Our minimum investment is £2,500";
      } else if (self.intialInvestment > 10000000) {
        self.error = "Input cannot exceed £10m";
      }
    }

    function formatDate(date) {
      let monthNames = [
        "Jan", "Feb", "Mar",
        "Apr", "May", "Jun", "Jul",
        "Aug", "Sep", "Oct",
        "Nov", "Dec"
      ];

      let monthIndex = date.getMonth();
      let year = date.getFullYear();
    
      return monthNames[monthIndex] + ' ' + year;
    }

    function calculateData(data) {
      let input:any = document.getElementById("currency-field");
      input = input.value;

      data.unshift({
        date: 'Dec 2015',
        click: 0,
        arc: 0,
        clickValue: input,
        arcValue: input,
      });
      
      data.forEach(function(item, index) {
        if (index !== 0) {
          let previous = data[index - 1];
          item.clickValue = (previous.clickValue*(1+(item.click/100))).toFixed(2);
          item.arcValue = (previous.arcValue*(1+(item.arc/100))).toFixed(2);
        }
      });
     
      self.percentageIncrease = ((data[data.length-1].clickValue - input) / input * 100).toFixed(2);
      self.valueIncrease = (data[data.length-1].clickValue - input).toFixed(2);
      self.valueIncrease = self.valueIncrease.toLocaleString('en', {minimumFractionDigits: 2}).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  }
}

