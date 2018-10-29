import { HoverProcessor } from './data_model/hover_processor';
import { QueryProcessor } from './data_model/query_processor';
import { FilterProcessor } from './data_model/filter_processor';


const d3 = require('d3');
const d3_svg = require('d3-svg');

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
    if (visData['realdata'] != undefined ){
      this.buildit(visData['attributes'], visData['realdata'], visData);
    }
    
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
    var clicklist = [];
    var thefilterdata = [];

    for (var j=0; j < rawdata.length; j++){
      var arrayItem = rawdata[j]
      var attr = arrayItem['key'];
      var refinedata0 = arrayItem['value']
      var currentbar = {'attribute': attr};
      refinedata0.forEach(function (dataItem){
        var attr_val =  dataItem['key'];
        var doc_count = dataItem['doc_count'];
        xData.push(dataItem['key']);
        currentbar[attr_val] = doc_count;
      });
      data.push(currentbar);
    }

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
      margin = {top: 20, right: 20, bottom: 30, left: 60},
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom;


    d3.selection.prototype.moveToFront = function() {  
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
    };

    // load the csv and create the chart
    var series = d3.stack()
      .keys(xData)
      .offset(d3.stackOffsetDiverging)
      (data);

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
      .style("position", "fixed")
      .style("visibility", "hidden");

        
    tooltip.append("rect")
      .attr("width", 140)
      .attr("height", 80)
      .attr("rx", 10)         // set the x corner curve radius
      .attr("ry", 10)
      .attr("fill", "#f5f5f5");

    tooltip.append("text")
      .attr("class","tooltipattr")
      .attr("x", 15)
      .attr("dy", "2em")
      .style("opacity", 1)
      .style("font-size", "12px")
      .style("font-weight", "bold");

    tooltip.append("text")
      .attr("class","tooltipquant")
      .attr("x", 15)
      .attr("dy", "3.5em")
      .style("opacity", 1)
      .style("font-size", "12px")
      .style("font-weight", "bold");

    tooltip.append("text")
      .attr("class","tooltippercent")
      .attr("x", 15)
      .attr("dy", "5em")
      .style("opacity", 1)
      .style("font-size", "12px")
      .style("font-weight", "bold");

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
        .attr("quant", function(d) { return (d['1']-d['0']);})
        .attr("percent", function(d) {
          var tempquant = 0;
          var myquant = d['1']-d['0'];
          for (const [key, value] of Object.entries(d.data)) {
            if(key != "attribute"){
              tempquant += value;
            }
          }
          var mypercent = ((myquant * 1.0 / tempquant)* 100).toFixed(2);
          return mypercent;
        })
      .on("mouseover", async function(d, i) {
        d3.selectAll("line").remove();
        d3.selectAll(".highlightrects").remove();
        tooltip.style("visibility", "visible");
        d3.select(this)
          .transition()
          .duration(100)
          .attr('r', 20);

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
          
          const hp = new HoverProcessor(visData);
          var relations = [];

          await hp.getrelations(attr_name, attr_val).then(function(result) {
            relations = result;
          });

          for (var q=0; q < xData.length; q++){
            var node_attrval = allthenodes.childNodes[q].getAttribute("attrval");
            var node_fill = allthenodes.childNodes[q].getAttribute("fill");
            for (var s=0; s < attrs.length; s++){
              if((allthenodes.childNodes[q]).childNodes[s].getAttribute("height") != "NaN"){
                var secondgnode = (allthenodes.childNodes[q]).childNodes[s];
                var node_attrname = secondgnode.getAttribute("attrname");

                var node_height = Number(secondgnode.getAttribute("height"));
                var node_width = Number(secondgnode.getAttribute("width"));
                var node_x = Number(secondgnode.getAttribute("x"));
                var node_y = Number(secondgnode.getAttribute("y"));

                if(node_attrname != attr_name){
                  
                  var relation_count = relations[node_attrname][node_attrval];

                  if (Number(relation_count) != 0){
                    var new_height = (Number(node_height)*Number(relation_count));;

                    svg.append("rect")
                      .attr("x", node_x)
                      .attr("y", node_y)
                      .attr("width", node_width)
                      .attr("height", node_height-new_height)
                      .attr("fill", "white")
                      .style("opacity", 0.5)
                      .attr("class", "highlightrects");

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


                  } else {
                    svg.append("rect")
                      .attr("x", node_x)
                      .attr("y", node_y)
                      .attr("width", node_width)
                      .attr("height", node_height)
                      .attr("fill", "white")
                      .style("opacity", 0.5)
                      .attr("class", "highlightrects");
                  }
                } else{
                  if (attr_val != node_attrval){
                    svg.append("rect")
                      .attr("x", node_x)
                      .attr("y", node_y)
                      .attr("width", node_width)
                      .attr("height", node_height)
                      .attr("fill", "white")
                      .style("opacity", 0.5)
                      .attr("class", "highlightrects");
                  }
                }
              }
            }
          }
        }
      })
      .on("mouseout", function() {
        d3.selectAll("line").remove();
        d3.selectAll(".highlightrects").remove(); 
        tooltip.style("visibility", "hidden");
        d3.select(this)
          .transition()
          .duration(100)
          .attr('r', 10)
          .attr('fill', this.color);
      })
      .on("mousemove", function(d) {
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
        var attr_quantity = tempvals.childNodes[numtouse].getAttribute("quant");
        var attr_percent = tempvals.childNodes[numtouse].getAttribute("percent");
        var offset = $(".myvis-div").offset();
        var tooltipx = (Number(event.pageX) - offset.left); //525
        var tooltipy = (Number(event.pageY) - offset.top); //35
        if (Number(event.pageX) >= 1220){
          tooltipx = tooltipx - 170;
          tooltipy = tooltipy - 100;
        }
        
        var tooltipattr = attr_name+": "+attr_val;
        var tooltipval = "value: "+attr_quantity;
        var tooltippercent = "percentage: "+attr_percent+"%";
        if( tooltipattr.length >= 19 || tooltipval.length >= 19 || tooltippercent.length >= 19){
          var tooltipwidth = 140+(3*Math.max(tooltipattr.length , tooltipval.length, tooltippercent.length));
          tooltip.select("rect").attr("width", tooltipwidth);
        } else {
          tooltip.select("rect").attr("width", 140);
        }
        tooltip.attr("transform", "translate(" + tooltipx + "," + tooltipy + ")");
        tooltip.select(".tooltipattr").text(tooltipattr);//(d[1]-d[0]);
        tooltip.select(".tooltipquant").text(tooltipval);
        tooltip.select(".tooltippercent").text(tooltippercent);
        tooltip.raise();
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

        thefilterdata.push(tempdict);

        setTimeout(function(){
          puttingthefilter(thefilterdata);
        },3000);
      });
    
    svg.append("g")
        .attr("transform", "translate(0," + y(0) + ")")
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(d3.axisLeft(y));


    function addtofilterbar(){
      FilterProcessor.putfilters(thefilterdata);
    }

    function executinclick(){
      var querytxt = "";
      for(var p=0; p < clicklist.length; p++){
        if(p+1 == clicklist.length){
          querytxt += clicklist[p]['attr']+":"+clicklist[p]['key'];
        } else{
          querytxt += clicklist[p]['attr']+":"+clicklist[p]['key']+" "+"AND ";
        }
      }
      console.log(querytxt);
      $('.kuiLocalSearchInput').val(querytxt).trigger('input');
      $('.kuiLocalSearchButton').click()
    }

    function stackMin(serie) {
      return d3.min(serie, function(d) { return d[0]; });
    }

    function stackMax(serie) {
      return d3.max(serie, function(d) { return d[1]; });
    }

    var puttingthefilter = function(talal, tempdict) {
      talal.vis.params.fpc.putfilters(tempdict);
    }.bind(null, this)

    
    return new Promise(resolve => {
      resolve('when done rendering');
    });
  }
};

export { VisController };