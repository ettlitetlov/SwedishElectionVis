function Map(data2014, data2010, data2006, data2002, pcYear, sweden_map_json){
  //constructor;

  this.data2014 = data2014;
  this.data2010 = data2010;
  this.data2006 = data2006;
  this.data2002 = data2002;

  this.sweden_map_json = sweden_map_json;

  //active dataset
  var data = data2014;
  this.data = data;

  var dataSetArray = [data2002,data2006,data2010,data2014];
  
  //var data = data2002;
  var time = 0;
  var oldTime = 0;

  var div = '#map';
  var parentWidth = $(div).parent().width();
  var margin = {top: 0, right: 0, bottom: 0, left: 0},
            width = parentWidth - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

  // The order of : Moderaterna, Centerpartiet, Folkpartiet, Kristdemokraterna, Miljöpartiet, Socialdemokraterna, Vänsterpartiet, Sverigedemokraterna, Övriga
  var partyColors = ['#004b8d', '#51ba66', '#3d70a4', '#6d94bb', '#379c47', '#d82f27', '#b02327', '#e7e518', '#BDC3C7'];
  const partys = ["M", "C", "F", "KD", "MP", "S", "V", "SD", "Övriga"];
  
   //initialize zoom
   var zoom = d3.zoom()
    .scaleExtent([1, 10])
    .on('zoom', move);


  //initialize tooltip
  var tooltip = d3.select(div).append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

  var projection = d3.geoMercator()
	 .scale(945)
	 .translate([width *-0.1, height * 3.2]);
	 
  var path = d3.geoPath()
      .projection(projection);

  var svg = d3.select(div).append("svg")
      .attr("width", width)
      .attr("height", height)
      .call(zoom);

  var g = svg.append("g");
  
  var municipalities = topojson.feature(sweden_map_json,
    sweden_map_json.objects.sverige).features;

  function move() {
      g.style("stroke-width", 1.5 / d3.event.transform.k + "px");
      g.attr("transform", d3.event.transform);
  }

  var muni = g.selectAll(".sverige").data(municipalities);
  muni.enter().insert("path")
  .attr("class", "region")
  .attr("d", path)
  .attr("id", function(d) { return d.properties.KNKOD; })
  .attr("title", function(d) { return d.properties.KNNAMN; })
  .style("fill", function(d) { return partyColors[getColorIndex(d.properties.KNKOD)]; })

  this.updateData = function (){  //dataSet as argument
    //change dataset with switch.
    switch(document.getElementById("selected_year").value){
      case "2002":
        data = data2002;
        this.data = data;
        break;
      case "2006":
        data = data2006;
        this.data = data;
        break;
      case "2010":
        data = data2010;
        this.data = data;
        break;
      case "2014":
        data = data2014;
        this.data = data;
        break;
    }

    d3.selectAll("path").data(municipalities)
    .attr("class", "region")
  .attr("d", path)
  .attr("id", function(d) { return d.properties.KNKOD; })
  .attr("title", function(d) { return d.properties.KNNAMN; })
  .style("fill", function(d) { return partyColors[getColorIndex(d.properties.KNKOD)]; })
          
    //tooltip
    .on("mousemove", function(d) {
      d3.select(this).style('stroke','white');
      d3.select(this).style('opacity','0.7');

      tooltip.transition()
          .duration(200)
          .style("opacity", .9);
      var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );
      tooltip
      .attr("style", "left:"+(mouse[0]+30)+"px;top:"+(mouse[1]+30)+"px")
      .html(d.properties.KNNAMN);
    })
    .on("mouseout",  function(d) {

        d3.select(this).style('stroke','none');
        d3.select(this).style('opacity','1.0');
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    })
          
    //selection
    .on("click",  function(d) {
    var muniData = pcObjectBuilder(d);
    pc.updatePC(muniData);
    bc.selectedMunicipaliti(d,data);
    });

    //muni.selectAll("path").exit().remove();
    console.log('Execution time: ' + (time - oldTime));
    oldTime = time;
    
  }

  this.updateData();

  // Denna function returnerar ett index beroende på vilket parti som är mest röstat på i en kommun
  // Timar också hur lång tid den tar att exekevera
  function getColorIndex(countyCode){
    var start = new Date().getTime();
    var key = Object.keys(data[0])[2];
    var region = Object.keys(data[0])[0];
    var largest = 0.0;
    var counter = 0;
    var index = 0;

    for(var i = 0; i < data.length; i++)
    {
      if(data[i][region].match(/\d+/) == countyCode)   //Object.keys(data[0])[0].match(/\d+/)
      {
        if(parseFloat(data[i][key]) > largest)
        {
          largest = data[i][key];
          index = counter;
        }
        counter++;
      }
    }
    var end = new Date().getTime();
    time = time + (end - start);
    return index; 
  }

  // Function to build an object to send to parallel coordinates
  function pcObjectBuilder(value){
    var yearArray = [2002,2006,2010,2014];
    var listOfLists = [];
    var pcChartData = []
      
      for(var i = 0; i < 4; i++){
        var theYear = "y" + yearArray[i];
        var list = [];
        var key = Object.keys(dataSetArray[i][0])[2];
        var counter = 0;

        for(var j = 0; dataSetArray[i].length; j++){

          if(dataSetArray[i][j].region.match(/\d+/) == value.properties.KNKOD)
          {
            list.push(dataSetArray[i][j][key]);
            counter++
          }
          listOfLists[i] = list;
          if (counter == 9) break;
        }

      }

      //Populate pcChartData
      for(var i = 0; i < 9 ; i++){
        pcChartData.push({
          parti : partys[i],
          ["y" + yearArray[0]] : listOfLists[0][i],
          ["y" + yearArray[1]] : listOfLists[1][i],
          ["y" + yearArray[2]] : listOfLists[2][i],
          ["y" + yearArray[3]] : listOfLists[3][i]
        })
      }
      return pcChartData;
  }
  


    /*~~ Highlight countries when filtering in the other graphs~~*/
  this.selectCountry = function(value){
	  
		var country = d3.selectAll('.region');
			country.style('stroke', function(d){
				
				return value.every(function(v){
			
					return v.region != d.properties.KNName ? "red": null
					
			})? null : "red" 
		});

  }

}
