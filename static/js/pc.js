/*
  Created: Jan 14 2018
  Author: Kahin Akram Hassan
*/
function pc(data){
  this.data = data;
/*
  this.data2014 = data2014;
  this.data2010 = data2010;
  this.data2006 = data2006;
  this.data2002 = data2002;
*/
  //active dataset 
  //var data = data2014;

  var div = '#pc-chart';


//En overwiev av korelationen mellan koordinaterna
  
  var parentWidth = $(div).parent().width();
  var margin = {top: 40, right: 0, bottom: 10, left: 100},
      width = parentWidth - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

  //dimensions for the axes.
  //Caution: Attributes in the function needs to be changed if data file is changed
  var dimensions = axesDims(height);
//console.log("Dimensions 1: " + dimensions[0].name);
  dimensions.forEach(function(dim) {
    dim.scale.domain(dim.type === "number"
        ? d3.extent(data, function(d) { return +d[dim.name]; })
        : data.map(function(d) { return d[dim.name]; }).sort());
  });
//console.log("Dimensions 2: " + dimensions[4].name);
  //Tooltip
  var tooltip = d3.select(div).append("div")
       .attr("class", "tooltip")
       .style("opacity", 0);

  var line = d3.line()
     .defined(function(d) { return !isNaN(d[1]); });

  //Y axis orientation
  var yAxis = d3.axisLeft();

  var svg = d3.select(div).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  /* ~~ Task 6 Scale the x axis ~~*/
  
  var x = d3.scaleBand()
	  .domain(dimensions.map(function(d) { return d.name;}))
	  .range([0, width]);
  
  /* ~~ Task 7 Add the x axes ~~*/
  var axes = svg.selectAll(".axes")
  .data(dimensions)
	  .enter().append("g")
	  .attr("class", "dimension")
	  .attr("transform", function(d) {return "translate(" + x(d.name) + ")";}); 

        axes.append("g")
          .attr("class", "axis")
          .each(function(d) { d3.select(this).call(yAxis.scale(d.scale)); })
          .append("text")
          .attr("class", "title")
          .style('fill','black')
          .style('font-size','9px')
          .attr("text-anchor", "middle")
          .attr("y", -9)
          .text(function(d) { return d.name; });


    //Task 8 initialize color scale
  var cc = [];
  var color = d3.scaleOrdinal(d3.schemeCategory20);
  // The order of : Moderaterna, Centerpartiet, Folkpartiet, Kristdemokraterna, Miljöpartiet, Socialdemokraterna, Vänsterpartiet, Sverigedemokraterna,Fi, Övriga
  var partyColors = ['#004b8d', '#51ba66', '#3d70a4', '#6d94bb', '#379c47', '#d82f27', '#b02327', '#e7e518', '#CC0066', '#BDC3C7'];
	data.forEach(
	function(d, i) {
    cc = partyColors;
	}
	);	

    var background = svg.append("g")
       .attr("class", "background")
       .selectAll("path")
       .data(data)
       .enter().append("path")
       .attr("d", draw); // Uncomment when x axis is implemented

    var foreground = svg.append("g")
       .attr("class", "foreground")
       .selectAll("path")
       .data(data)
       .enter().append("path")
       .attr("d", draw) // Uncomment when x axis is implemented
	   .style("stroke", function(d, i){ return cc[d.parti]; });
	   
	   


    /* ~~ Task 9 Add and store a brush for each axis. ~~*/
    axes.append("g")
        .attr("class", "brush")
		.each(function(d) {
		 d3.select(this).call(d.brush = d3.brushY()
		 .extent([[-10,0], [10,height]])
		 .on("start", brushstart)
         .on("brush", brush)
         .on("end", brush)
		)
	  })
        .selectAll("rect")
        .attr("x", -10)
        .attr("width", 20);

    //Select lines for mouseover and mouseout
    var projection = svg.selectAll(".background path, .foreground path")
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);


    function mouseover(d) {

      //Only show then active..
      tooltip.transition().duration(200).style("opacity", .9);
      var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );
      tooltip.attr(
        "style",
        "left:"+(mouse[0]+30)+
        "px;top:"+(mouse[1]+40)+"px")
        .html(d.parti);

      svg.classed("active", true);

      // this could be more elegant
      if (typeof d === "string") {
        projection.classed("inactive", function(p) { return p.name !== d; });
        projection.filter(function(p) { return p.name === d; }).each(moveToFront);

      } else {
        projection.classed("inactive", function(p) { return p !== d; });
        projection.filter(function(p) { return p === d; }).each(moveToFront);
      }
    }

    function mouseout(d) {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
      svg.classed("active", false);
      projection.classed("inactive", false);
    }

    function moveToFront() {
      this.parentNode.appendChild(this);
    }

    function draw(d) {
      return line(dimensions.map(function(dim) {
        return [x(dim.name), dim.scale(d[dim.name])];
      }));
    }

    function brushstart() {
      d3.event.sourceEvent.stopPropagation();
    }

    // Handles a brush event, toggling the display of foreground lines.
    function brush(d) {

      var actives = [];
      svg.selectAll(".dimension .brush")
      .filter(function(d) {
        return d3.brushSelection(this);
      })
      .each(function(d) {
        actives.push({
          dim: d,
          extent: d3.brushSelection(this)
        });
      });

      foreground.style("display", function (d) {
          return actives.every(function (active) {
             var dim = active.dim;
             var ext = active.extent;
             var l = within(d, ext, dim);
             return l;
          }) ? null : "none";
      });

      function within(d, extent, dim) {
        var w =  dim.scale(d[dim.name]) >= extent[0]  && dim.scale(d[dim.name]) <= extent[1];

        if(w){
            /* ~~ Call the other graphs functions to highlight the brushed.~~*/
        }

        return w;
      };


    } //Brush

    //Select all the foregrounds send in the function as value
    this.selectLine = function(value){
       /* ~~ Select the lines ~~*/
    };

    function axesDims(height){
        return [
            {
              name: "Party",
              scale: d3.scaleBand().range([0, height]),
              type: "string"
            },
            {
              name: "2002",
              scale: d3.scaleLinear().range([0, height]),
              type: "number"
            },
            {
              name: "2006",
              scale: d3.scaleLinear().range([height, 0]),
              type: "number"
            },
            {
              name: "2010",
              scale: d3.scaleLinear().range([height, 0]),
              type: "number"
            },
            {
              name: "2014",
              scale: d3.scaleLinear().range([height, 0]),
              type: "number"
            }
            
        ];
    }

}
