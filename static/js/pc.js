/*
  Created: Jan 14 2018
  Author: Kahin Akram Hassan
*/
function pc(data){
  var pcYear = data;
  this.data = data;
  var div = '#pc-chart';

  //Finds the maxvalue of the data
  var maxVal = d3.max(data, function (d) { return Math.max(d.y2002,d.y2006,d.y2010,d.y2014)});


//En overwiev av korelationen mellan koordinaterna
  
  var parentWidth = $(div).parent().width();
  var margin = {top: 40, right: 0, bottom: 10, left: 100},
      width = parentWidth - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

  //Dimensions for the axes.
  var dimensions = axesDims(height);
  // Sets the y-axis scales between 0 and maxvalue
  dimensions.forEach(function(dim) {
    dim.scale.domain(dim.type === "number"
        ? d3.extent([maxVal, 0])
        : data.map(function(d) { return d[dim.name]; }).sort());
  });

  //Tooltip
  var tooltip = d3.select(div).append("div")
       .attr("class", "tooltip")
       .style("opacity", 0);

  var line = d3.line()
     .defined(function(d) { return "!isNaN(d[1])"; });

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


  // The order of : Moderaterna, Centerpartiet, Folkpartiet, Kristdemokraterna, Miljöpartiet, Socialdemokraterna, Vänsterpartiet, Sverigedemokraterna,Fi, Övriga
  var partyColors = ['#004b8d', '#51ba66', '#3d70a4', '#6d94bb', '#379c47', '#d82f27', '#b02327', '#e7e518', '#CC0066', '#BDC3C7'];

    var background = svg.append("g")
       .attr("class", "background")
       .selectAll("path")
       .data(data)
       .enter().append("path")
       .attr("d", draw); // Uncomment when x axis is implemented

       var index = -1;
    var foreground = svg.append("g")
       .attr("class", "foreground")
       .selectAll("path")
       .data(data)
       .enter().append("path")
       .attr("d", draw) // Uncomment when x axis is implemented
	    .style("stroke", function(d, i){ index++; return partyColors[index]; });
	   
	   


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
              name: "parti",
              scale: d3.scalePoint().range([0, height]),
              type: "string"
            },
            {
              name: "y2002",
              scale: d3.scaleLinear().range([height,0]),
              type: "number"
            },
            {
              name: "y2006",
              scale: d3.scaleLinear().range([height, 0]),
              type: "number"
            },
            {
              name: "y2010",
              scale: d3.scaleLinear().range([height, 0]),
              type: "number"
            },
            {
              name: "y2014",
              scale: d3.scaleLinear().range([height, 0]),
              type: "number"
            }
            
        ];
    }

    this.updatePC = function(dataSet) {
      data = dataSet;
      this.data = data;
      maxVal = d3.max(data, function (d) { return Math.max(d.y2002,d.y2006,d.y2010,d.y2014)});

      // Sets the y-axis scales between 0 and maxvalue
      dimensions.forEach(function(dim) {
        dim.scale.domain(dim.type === "number"
            ? d3.extent([maxVal, 0])
            : data.map(function(d) { return d[dim.name]; }).sort());
      });

      svg.selectAll(".dimension")
      .data(dimensions)
      .transition()
      .duration(750)
      .attr("class", "dimension")
      .attr("transform", function(d) {return "translate(" + x(d.name) + ")";});
      
      svg.selectAll(".axis")
      .attr("class", "axis")
      .each(function(d) { d3.select(this).transition().duration(750).call(yAxis.scale(d.scale)); }); 

      svg.selectAll(".background").selectAll("path")
       .data(data)
       .transition()
       .duration(750)
       .attr("d", draw); // Uncomment when x axis is implemented */

      var index = -1;
      svg.selectAll(".foreground").selectAll("path")
       .data(data)
       .transition()
       .duration(750)
       .attr("d", draw) // Uncomment when x axis is implemented
	    .style("stroke", function(d, i){ index++; return partyColors[index]; });
    }


}
