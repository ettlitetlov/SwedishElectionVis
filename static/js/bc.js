function bc(data){
    var pcYEAR = data;
    this.data = data;
    var flag = true;
    var div = '#barchart';

    var height = 500;
    var parentWidth = $(div).parent().width();
    var margin = {top: 20, right: 20, bottom: 60, left: 40},
        width = parentWidth - margin.right - margin.left,
        height = height - margin.top - margin.bottom;

    // The order of : Moderaterna, Centerpartiet, Folkpartiet, Kristdemokraterna, Miljöpartiet, Socialdemokraterna, Vänsterpartiet, Sverigedemokraterna, Övriga
    var partyColors = ['#004b8d', '#51ba66', '#3d70a4', '#6d94bb', '#379c47', '#d82f27', '#b02327', '#e7e518', '#BDC3C7'];
 
    var tooltip = d3.select(div).append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    
    const partys = ["M", "C", "F", "KD", "MP", "S", "V", "SD", "Övriga"];
    
    var xScale = d3.scaleBand().domain(partys).padding(0.3).range([0,width]);
    var yScale = d3.scaleLinear().domain([0,65]).range([height, 0]);
   
    var svg = d3.select(div).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")");
    
		//xAxis
	svg.append("g")
		.attr("transform", "translate(0, " + height +")")
		.call(d3.axisBottom(xScale))
		.append("text")
		.attr("transform", "translate("+ (width/2) +", " + (height + 35) + ")")
		.style("text-anchor", "middle")
		.text("Parti");
		
		//yAxis
	svg.append("g")
		.attr("class", "y axis")
        .call(d3.axisLeft(yScale));

        //title
    svg.append("text")
        .attr("class", "title")
        .attr("transform","translate(" + width/2 +" , 10)")
        .attr("font-size", 18)
		.style("text-anchor", "middle")
        .text("Röststatistik i sverige år " + document.getElementById("year").value);

        var bar = svg.selectAll("rect").data(data, d => d.parti)                          //här,
        var theYear = "y" + document.getElementById("year").value;
        var index = -1;
        
        bar.data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return xScale(d.parti); })
        .attr("width", xScale.bandwidth())
        .attr("y", function(d) { return yScale(d[theYear]); })
        .attr("height", function(d) { return height - yScale(d[theYear]); })
        .style("fill", function (d) { index++; return partyColors[index]; } )
        .on("mousemove", function(d) {
            d3.select(this).transition()
            .duration(100).style('stroke','#B6B6B4');
            d3.select(this).transition()
            .duration(100).style('opacity',"0.7")
        })
        .on("mouseout",  function(d) {
            d3.select(this).transition()
            .duration(500).style('stroke','none');
            d3.select(this).transition()
            .duration(500).style('opacity', "1.0")            

        });
      

        bar.enter().append("text")
            .attr("class", "label")
            .text(function(d){
                return d3.format(".01%")(d[theYear] / 100);
            })
            .attr("y", function(d) { return yScale(d[theYear]); })
            .attr("x", function(d) { return xScale(d.parti) ; }) //margin right
            .attr("font-family", "sans-serif")
            .attr("dy", "-.15em")
            .attr("text-anchor", "middle")
            .attr("dx", function(d) {
                return ((xScale.bandwidth()) + 3)/ 2;
            })
            .style("fill", "#B6B6B4")
            .style("font-size", "16px");
        
    // append the rectangles for the bar chart
    function updateBar() {

        if(flag){
            data = pcYEAR;
            svg.selectAll(".title").text( "Röststatistik i Sverige år " + document.getElementById("year").value);
            pc.updatePC(pcYEAR);
        }

        flag = true;
        theYear = "y" + document.getElementById("year").value;

        var index = -1;

        d3.selectAll("rect").data(data)
        .transition()
        //.ease(d3.easeElastic)
        .duration(750)
        .attr("class", "bar")
        .attr("x", function(d) { return xScale(d.parti); })
        .attr("width", xScale.bandwidth())
        .attr("y", function(d) { return yScale(d[theYear]); })
        .attr("height", function(d) { return height - yScale(d[theYear]); })
        .style("fill", function (d) { index++; return partyColors[index]; } );

        d3.selectAll(".label").data(data)
        .transition()
        //.ease(d3.easeElastic)
        .duration(750)
        .tween("text", function(d) {
            var i = d3.interpolate(this.textContent, d[theYear]);
            return t => this.textContent = d3.format("0.01%")(parseFloat(i(t)).toFixed(1)/100);
        })

        .attr("y", function(d) { return yScale(d[theYear]); })
        .attr("x", function(d) { return xScale(d.parti) ; }) //margin right
        

    }

    d3.select("#year")
        .on("click", updateBar); 
		
    this.selectedMunicipaliti = function(value, nowData) {
      //if (value.properties.KNKOD == data) och hämta vilket årtal för att hämta från rätt dataset

      var key = Object.keys(nowData[0])[2];
      var region = Object.keys(nowData[0])[0];
      var counter = 0;
      var barChartData = [];
      var theYear = "y" + document.getElementById("year").value;

      for (var i = 0; i < nowData.length; i++) {
        if (nowData[i][region].match(/\d+/) == value.properties.KNKOD) {
          barChartData.push({
            parti: partys[counter],
            [theYear]: nowData[i][key]
          });

          ++counter;
        }

        if (counter == 9) break;
      }
      flag = false;
      data = barChartData;
      svg.selectAll(".title").text( "Röststatistik i " + value.properties.KNNAMN + " år " + document.getElementById("year").value);
      updateBar();
    };
    


}//End
