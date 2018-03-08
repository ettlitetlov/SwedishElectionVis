
var map, pc, bc;
function draw(activeData, data2014, data2010, data2006, data2002, pcYear, sweden_map_json){
  
  map = new Map(data2014, data2010, data2006, data2002, pcYear, sweden_map_json);
  pc = new pc(pcYear);
  bc = new bc(pcYear);
}

d3.queue()
    .defer(d3.csv, 'static/data/Swedish_Election_2014.csv')
    .defer(d3.csv, 'static/data/Swedish_Election_2010.csv')
    .defer(d3.csv, 'static/data/Swedish_Election_2006.csv')
    .defer(d3.csv, 'static/data/Swedish_Election_2002.csv')
    .defer(d3.csv, 'static/data/pcYear.csv')                  //#1
    .defer(d3.json,'static/maps/sverige-topo.json')
    .await(function(error, d2014, d2010, d2006, d2002, pcYear, sweden_map_json) {
      if (error) throw error;  
     
      draw(d2014, d2014, d2010, d2006, d2002, pcYear, sweden_map_json);
    });


function update(){
  map.updateData();
}
