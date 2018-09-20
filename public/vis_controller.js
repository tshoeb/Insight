import { HoverProcessor } from './data_model/hover_processor';
import { QueryProcessor } from './data_model/query_processor';

const d3 = require('d3');
const d3_svg = require('d3-svg');

//https://github.com/53seven/d3-svg

class VisController {
  constructor(el, vis) {
    this.vis = vis;
    this.el = el;

    this.container = document.createElement('div');
    this.container.id = 'myvis-container-div';
    this.el.appendChild(this.container);
  }

  destroy() {
    this.el.innerHTML = '';
  }

  render(visData, status) {
    console.log("i am the visualizer");
    console.log(visData);

    // var rawdata=[];
    //var rawdata = this.getdata(visData)
    if (visData['realdata'] != undefined ){//&& visData['realdata'] > 0){
      this.buildit(visData['attributes'], visData['realdata'], visData);
    }
    //await this._getdata(visData);

    // if (rawdata != undefined && rawdata.length > 0){
    //   await this._buildit(rawdata);
    // }
    return new Promise(resolve => {
      resolve('when done rendering');
    });
  }

  getdata(visData){
    var timeout = setInterval(function() { 
      if(visData['checker']) { 
          console.log(visData['checker']);
          clearInterval(timeout);
          if (visData['realdata'] != undefined && visData['realdata'] > 0){
            this.buildit(visData['realdata']);
          } 
        } 
    }, 100);
  }

  buildit(attrs, rawdata, visData){
    console.log("i m build it");
    var data = [];
    var xData=[];

    // console.log("length before printing:"+rawdata.length)
    // console.log("type of rawdata:"+typeof(rawdata));
    //console.log(rawdata);

    // rawdata.forEach(function (arrayItem) {
    //     var attr = arrayItem['key'];
    //     var refinedata0 = arrayItem['value']
    //     refinedata0.forEach(function (dataItem){
    //       var attr_val =  dataItem['key'];
    //       var doc_count = dataItem['doc_count'];
    //       xData.push(dataItem['key']);
    //       var currentbar = {'attribute': attr};
    //       currentbar[attr_val] = doc_count;
    //       data.push(currentbar);
    //     });
    // });

   //console.log("length:"+ rawdata.length);
    //console.log(rawdata[1]);
    for (var j=0; j < rawdata.length; j++){
      var arrayItem = rawdata[j]
      var attr = arrayItem['key'];//attrs[j]['attr'];
      console.log(j);
      console.log(attr);
      var refinedata0 = arrayItem['value']
      var currentbar = {'attribute': attr};
      refinedata0.forEach(function (dataItem){
        var attr_val =  dataItem['key'];
        var doc_count = dataItem['doc_count'];
        xData.push(dataItem['key']);
        // var currentbar = {'attribute': attr};
        currentbar[attr_val] = doc_count;
        //data.push(currentbar);
      });
      data.push(currentbar);
    }

    console.log(data);
    // console.log(xData);

    this.container.innerHTML = '';
    const vizfiltDiv = document.createElement(`div`);
    vizfiltDiv.className = `myvis-div`;

    vizfiltDiv.innerHTML = "<svg width=\"960\" height=\"600\"></svg>";

    vizfiltDiv.setAttribute('style', `height: 700px; width:600px;`);
    this.container.appendChild(vizfiltDiv);

    var margin = {top: 20, right: 50, bottom: 30, left: 50},
          width = 500 - margin.left - margin.right,
          height = 700- margin.top - margin.bottom;

    var svg = d3.select("svg"),
      margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom;
      // g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    // var svg = d3_svg.create(vizfiltDiv, {width: width + margin.left + margin.right, height: height + margin.top + margin.bottom});

    console.log("-----------------------")
    console.log(svg)
    console.log("-----------------------")
    // // set x scale
    // var x = d3.scaleBand()
    //   .rangeRound([0, width])
    //   .paddingInner(0.05)
    //   .align(0.1);

    // // set y scale
    // var y = d3.scaleLinear()
    //   .rangeRound([height, 0]);

    // // set the colors
    // var z = d3.scaleOrdinal()
    //   .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    // load the csv and create the chart
    var series = d3.stack()
      .keys(xData)
      .offset(d3.stackOffsetDiverging)
      (data);

    console.log(series);

    var x = d3.scaleBand()
        .domain(data.map(function(d) { return d.attribute; }))
        .rangeRound([margin.left, width - margin.right])
        .padding(0.1);

    var y = d3.scaleLinear()
        .domain([d3.min(series, stackMin), d3.max(series, stackMax)])
        .rangeRound([height - margin.bottom, margin.top]);

    var z = d3.scaleOrdinal()
      .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    var info = d3.scaleOrdinal()
      .range(xData);

    var tooltip = svg.append("g")
      .attr("class", "tooltip")
      .style("display", "none");
        
    tooltip.append("rect")
      .attr("width", 60)
      .attr("height", 20)
      .attr("fill", "white")
      .style("opacity", 0.5);

    tooltip.append("text")
      .attr("x", 30)
      .attr("dy", "1.2em")
      .style("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "bold");

    svg.append("g")
      .selectAll("g")
      .data(series)
      .enter().append("g")
        .attr("fill", function(d) { return z(d.key);})
        .attr("attrval", function(d) { return info(d.key); })
        .attr("class", function(d) {  if(String(info(d.key)).substring(0,1) == "_"){ return "filtered";} else{ return "normal";}})
      .selectAll("rect")
      .data(function(d) { return d; })
      .enter().append("rect")
        .attr("width", x.bandwidth)
        .attr("x", function(d) { return x(d.data.attribute); })
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return y(d[0]) - y(d[1]); })
        .attr("attrname", function(d) { return d.data.attribute;})
      .on("mouseover", async function(d, i) {
        // console.log("Mouseover for tooltip");
        tooltip.style("display", null);
        d3.select(this)
          .transition()
          .duration(100)
          .attr('r', 20)
          .attr('fill', '#DAA520');

        if (attrs.length > 1) {

          var tempvals = d3.select(this.parentNode)._groups[0][0];
          var allthenodes=(this.parentNode).parentNode;
          var numtouse = 0;
          for (var p=0; p < attrs.length; p++){
            var heightcheck = tempvals.childNodes[p].getAttribute("height");
            if (heightcheck != "NaN"){
              numtouse = p;
            }
          }
          var attr_name = tempvals.childNodes[numtouse].getAttribute("attrname");
          var attr_val = tempvals.getAttribute("attrval");

          // console.log(attr_name);
          // console.log(attr_val);
          
          const hp = new HoverProcessor(visData);
          var relations = [];

          await hp.getrelations(attr_name, attr_val).then(function(result) {
                relations = result;
            });
          console.log(relations);

          for (var q=0; q < xData.length; q++){
            var node_attrval = allthenodes.childNodes[q].getAttribute("attrval");
            for (var s=0; s < attrs.length; s++){
              if((allthenodes.childNodes[q]).childNodes[s].getAttribute("height") != "NaN"){
                var secondgnode = (allthenodes.childNodes[q]).childNodes[s];
                var node_attrname = secondgnode.getAttribute("attrname");
                if(node_attrname != attr_name){
                  
                  var relation_count = relations[node_attrname][node_attrval];
                  if (Number(relation_count) != 0){
                    var node_height = Number(secondgnode.getAttribute("height"));
                    var node_width = Number(secondgnode.getAttribute("width"));
                    var node_x = Number(secondgnode.getAttribute("x"));
                    var node_y = Number(secondgnode.getAttribute("y"));

                    var new_height = (Number(node_height)*Number(relation_count));;

                    // if (relation_count == 1){
                    //   new_height = Number(node_height);
                    // } else{
                    //   new_height = (Number(node_height)*Number(relation_count));
                    // }
                
                    console.log(node_attrname);
                    console.log(node_attrval);
                    console.log(relation_count);
                    console.log(new_height);

                    svg.append("line")
                      .attr("x1", node_x)
                      .attr("y1", node_y+node_height)
                      .attr("x2", node_x)
                      .attr("y2", node_y+node_height-new_height)
                      .attr("stroke-width", 1.5)
                      .attr("stroke", "red");
                    svg.append("line")
                      .attr("x1", node_x)
                      .attr("y1", node_y+node_height-new_height)
                      .attr("x2", node_x+node_width)
                      .attr("y2", node_y+node_height-new_height)
                      .attr("stroke-width", 1.5)
                      .attr("stroke", "red");
                    svg.append("line")
                      .attr("x1", node_x+node_width)
                      .attr("y1", node_y+node_height-new_height)
                      .attr("x2", node_x+node_width)
                      .attr("y2", node_y+node_height)
                      .attr("stroke-width", 1.5)
                      .attr("stroke", "red");
                    svg.append("line")
                      .attr("x1", node_x+node_width)
                      .attr("y1", node_y+node_height)
                      .attr("x2", node_x)
                      .attr("y2", node_y+node_height)
                      .attr("stroke-width", 1.5)
                      .attr("stroke", "red");


                  }
                }
              }
            }
            // for (var h=0; h < relations.length; s++){
            //   //console.log(relations[h]['attribute']);
            //   if (node_attrname == relations[h]['attribute']){
            //     var relation_count = relations[h][node_attrval];
            //     console.log("**************");
            //     console.log(relation_count);
            //   }
            // }
          }
        }
        // console.log(d);
        // console.log(i); 
      })
      .on("mouseout", function() {
        d3.selectAll("line").remove(); 
        tooltip.style("display", "none");
        d3.select(this)
          .transition()
          .duration(100)
          .attr('r', 10)
          .attr('fill', this.color);
      })
      .on("mousemove", function(d) {
        // console.log("Tooltip Mouse move")
        // console.log(d)
        // console.log(this.x.baseVal.value);
        var tempvals = d3.select(this.parentNode)._groups[0][0];
        //var attr_name = tempvals.childNodes[0].getAttribute("attrname");
        var attr_val = tempvals.getAttribute("attrval");
        var xPosition = d3.mouse(this)[0] - 5;
        var yPosition = d3.mouse(this)[1] - 5;
        tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
        tooltip.style("display", "contents");
        // tooltip.attr("transform", "translate(" + this.x.baseVal.value - 30 + "," + this.y.baseVal.value + ")");
        tooltip.select("text").text("Value: "+attr_val);//(d[1]-d[0]);
      })
      .on("click", function(){
        var tempvals = d3.select(this.parentNode)._groups[0][0];
        var allthenodes=(this.parentNode).parentNode;
        var numtouse = 0;
        for (var p=0; p < attrs.length; p++){
          var heightcheck = tempvals.childNodes[p].getAttribute("height");
          if (heightcheck != "NaN"){
            numtouse = p;
          }
        }
        var attr_name = tempvals.childNodes[numtouse].getAttribute("attrname");
        var attr_val = tempvals.getAttribute("attrval");

        console.log(attr_name);
        console.log(attr_val);

        var tempdict = {}
        tempdict['attr'] = attr_name;
        tempdict['key'] = attr_val;

        puttingthefilter(tempdict);
      });
    
    svg.append("g")
        .attr("transform", "translate(0," + y(0) + ")")
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(d3.axisLeft(y));

    var filter_y=0;
    var filter_height= 0;

    d3.selectAll(".filtered").each(function() {
      console.log(this.childNodes.length);
      for (var p=0; p < this.childNodes.length; p++){
        var heightcheck = this.childNodes[p].getAttribute("height");
        if (heightcheck != "NaN"){
          if (Number(this.childNodes[p].getAttribute("y")) > filter_y){
            filter_y = Number(this.childNodes[p].getAttribute("y"));
            filter_height = Number(this.childNodes[p].getAttribute("height"))
          }
        }
      }
      // console.log(Number(d3.select(this).attr("y")));
      // if (Number(d3.select(this).attr("y")) > filter_y){
      //   filter_y = d3.select(this).attr("y");
      // }
    });

    console.log("i am line y");
    console.log(filter_y);
    if (filter_y > 0 ){
      svg.append("line")
      .attr("x1", 0)
      .attr("y1", filter_y+filter_height)
      .attr("x2", 900)
      .attr("y2", filter_y+filter_height)
      .attr("stroke-width", 1.5)
      .attr("stroke", "black");
    }




    // svg.append("g")
    //   .selectAll("g")
    //   .data(series)
    //   .enter().append("g")
    //     .attr("fill", 'red')
    //   .selectAll("rect")
    //   .data(function(d) { return d; })
    //   .enter().append("rect")
    //     .attr("width", 600)
    //     .attr("x", 300)
    //     .attr("y", 300)
    //     .attr("height", 120);


    // svg.append("line")
    //   .attr("x1", 300)
    //   .attr("y1", 300)
    //   .attr("x2", 300)
    //   .attr("y2", 420)
    //   .attr("stroke-width", 2)
    //   .attr("stroke", "black")

    // svg.append("line")
    //   .attr("x1", 300)
    //   .attr("y1", 420)
    //   .attr("x2", 500)
    //   .attr("y2", 420)
    //   .attr("stroke-width", 2)
    //   .attr("stroke", "black")

    function stackMin(serie) {
      return d3.min(serie, function(d) { return d[0]; });
    }

    function stackMax(serie) {
      return d3.max(serie, function(d) { return d[1]; });
    }

    var puttingthefilter = function(talal, tempdict) {

      // console.log("TALALAL INSIDEEE")
      // console.log(talal.vis.params)
      talal.vis.params.filtervals.push(tempdict);
      $("#magicbutton").click()
    }.bind(null, this)

    
    return new Promise(resolve => {
      resolve('when done rendering');
    });
  }
};

export { VisController };