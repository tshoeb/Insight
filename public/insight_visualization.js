import { HoverProcessor } from './data_model/hover_processor';
import { QueryProcessor } from './data_model/query_processor';
import { FilterProcessor } from './data_model/filter_processor';


const d3 = require('d3');
const d3_svg = require('d3-svg');
const tinycolor = require('tinycolor2');
const iwanthueApi = require("iwanthue-api")
//const d3_color = require('d3-scale-chromatic');

class InsightVisualizationProvider {
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
    console.log(visData);
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

    vizfiltDiv.innerHTML = "<svg width=\"960\" height=\"600\"></svg><div id='table'></div>";

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

    var colorlist = [];
    var colordict = {};
    var colornum = 1.00;
    var topnlist = [];

    for (var h=0; h < visData['attributes'].length; h++){
      topnlist.push(visData['attributes'][h]['topn'])
    }

    // var topnmax = Math.max( ...topnlist );

    // for (var r=0; r < topnmax+1; r++){
    //   var intercolor = "";
    //   if (r < 11){
    //     intercolor = d3.interpolateBlues(colornum);
    //   } else {
    //     intercolor = d3.interpolateGreens(colornum);
    //   }
      
    //   var colorprocess = tinycolor(intercolor);
    //   colorlist.push(colorprocess.toHexString());
    //   if (r == 11){
    //     colornum = 0.90;
    //   } else {
    //     colornum = colornum - 0.05;
    //   }
    // }

    var colors = iwanthueApi().generate(
      (visData['attributes'].length),                   // Number of colors to generate
      function(color){     // This function filters valid colors...
        var hcl = color.hcl();
        return hcl[0]>=0 && hcl[0]<=360 && // ...for a specific range of hues
               hcl[1]>=0 && hcl[1]<=3 &&
               hcl[2]>=0 && hcl[2]<=1.5;
      },
      false,               // Use Force Vector (for k-Means, use true)
      50                   // Color steps (quality)
    );

    // Sort colors by differentiation
    var sortedColors = iwanthueApi().diffSort(colors);
    for (var n=0; n < sortedColors.length; n++){      
      if(sortedColors[n] != undefined){
        var colorprocess = tinycolor(sortedColors[n].toString());
        //var colorprocess2 = tinycolor(sortedColors[n+1].toString());
        //console.log(typeof colorprocess);
        var thealpha = 1;
        var colorattr = rawdata[n]['value'];
        if (visData['rectorder'] == "descending"){
          for (var r=topnlist[n]; r >= 0 ; r--){
            colorprocess.setAlpha(thealpha);
            //colorlist.push(colorprocess.darken(n).toRgbString());
            var colorattr1 = colorattr[r];
            if (colorattr1 != undefined){
              //colordict[colorattr1['key']]= blendRGBColors(colorprocess.toRgbString(), colorprocess2.toRgbString(), thealpha)//colorprocess.darken(n).toRgbString()
              colordict[colorattr1['key']]= colorprocess.toRgbString()
              thealpha = thealpha - 0.07;
            }
          }
        } else {
          for (var r=0; r < topnlist[n]; r++){
            colorprocess.setAlpha(thealpha);
            //colorlist.push(colorprocess.darken(n).toRgbString());
            var colorattr1 = colorattr[r];
            if (colorattr1 != undefined){
              //colordict[colorattr1['key']]= blendRGBColors(colorprocess.toRgbString(), colorprocess2.toRgbString(), thealpha)//colorprocess.darken(n).toRgbString()
              colordict[colorattr1['key']]= colorprocess.toRgbString();
              thealpha = thealpha - 0.07;
            }
          }
        }
      }
    }

    //console.log(colordict);


    // if (visData['rectorder'] == "descending"){
    //   var z = colorlist.reverse();//d3.scaleOrdinal(
    // } else {
    //   var z = colorlist;

    // }

    

    //d3.interpolateBlues(1);
    //var z = d3.scaleOrdinal(d3.schemeBlues[9]);

    //console.log(d3.interpolateBlues(0.95));

    //var z = d3.scaleOrdinal()
      //.range(blues);
      //.range(['#fff7fb','#ece7f2','#d0d1e6','#a6bddb','#74a9cf','#3690c0','#0570b0','#045a8d','#023858']);
      //.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

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
        .attr("id", "stacks")
      .selectAll("g")
      .data(series)
      .enter().append("g")
        .attr("fill", function(d) { 
          //console.log(d);
          if (String(info(d.key)).includes("others")){
            return "#031832";
          } else {
            return colordict[d.key];
          }
        })
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
      .on("mouseover", function(){
        d3.selectAll("line").remove();
        d3.selectAll(".highlightrects").remove();
        tooltip.style("visibility", "visible");
        d3.select(this)
          .transition()
          .duration(100)
          .attr('r', 20);


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

        if (attrs.length > 1) {
          mouseoverrelations(attr_name, attr_val, allthenodes);
        }
        tablehighlight(attr_name, attr_val, "yellow");
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
        tablehighlight(attr_name, attr_val, "white");
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

    var tablewidth = x.bandwidth();
    
    var ticksinfo = svg.append("g")
        .attr("transform", "translate(0," + y(0) + ")")
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(d3.axisLeft(y));

    // var tickstxt = ticksinfo['_groups'][0][0].innerHTML;
    // var tickvalsearch = 0;
    // var tickvals = [];

    // do{
    //   var tickvalindex = tickstxt.indexOf("translate", tickvalsearch);
    //   var tickbracketindex = tickstxt.indexOf("(", tickvalindex);
    //   var tickcommaindex = tickstxt.indexOf(",", tickvalindex);
    //   var testinout = tickvalindex + "-" + tickbracketindex + "-" + tickcommaindex;
    //   //console.log(testinout);
    //   tickvals.push(parseFloat(tickstxt.substring(tickbracketindex+1, tickcommaindex)));
    //   tickvalsearch = tickvalindex+1;
    // }
    // while (tickstxt.indexOf("translate", tickvalsearch) != -1);

    //console.log(tickvals);

    //var presorttabledata = [];

    // for(var v=0; v < topnmax+1; v++){
    //   var tempvaldict = {};
    //   for(var s=0; s < rawdata.length; s++){
    //     if(columns.includes(rawdata[s]['key']) == false){
    //       columns.push(rawdata[s]['key']);
    //     }
    //     if(rawdata[s]['value'][v]){
    //       if (String(rawdata[s]['value'][v]['key']).includes("others") == false){
    //         tempvaldict[rawdata[s]['key']] = rawdata[s]['value'][v]['key'];
    //       }
    //     } else {
    //       tempvaldict[rawdata[s]['key']] = "";
    //     }
    //   }
    //   presorttabledata.push(tempvaldict)
    // }

    // var othertemp = tempvaldict[tempvaldict.length-1];
      // tempvaldict.splice(0, tempvaldict.length-1);
      // if(visData['rectorder'] == "descending"){
      //   tempvaldict = tempvaldict.reverse();
      // }
      // tempvaldict.unshift(othertemp);

    // console.log(presorttabledata);

    // if(visData['rectorder'] == "descending"){
    //   tabledata =  presorttabledata;
    // } else {
    //   tabledata =  presorttabledata.reverse();
    // }

    for(var s=0; s < rawdata.length; s++){
      var tableattr = rawdata[s]['key'];
      var tablex = x(tableattr);
      var tableattrvals = rawdata[s]['value'];
      var tabledata=[];
      var columns = [];
      columns.push(tableattr);
      var tableothersdict = {};
      tableothersdict [tableattr] = tableattr+"_others";
      tabledata.push(tableothersdict);
      for(var d=tableattrvals.length-1; d >= 0 ; d--){
        if(String(tableattrvals[d]['key']).includes("others") == false){
          var temptabledict = {};
          temptabledict[tableattr] = tableattrvals[d]['key'];
          tabledata.push(temptabledict);
        }
      }
      createtable(tableattr, tabledata, columns, tablex, tablewidth);
    }

    function createtable(attrname, tabledata, columns, tablex, tablewidth) {
      var table = d3.select("#table")
        .append("table")
        .attr("id", attrname+"-table")
        .style("top", "550px")
        .style("left", tablex+"px")
        .style("position", "absolute");
      var thead = table.append('thead');
      var tbody = table.append('tbody');


      // append the header row
      thead.append('tr')
        .selectAll('th')
        .data(columns).enter()
        .append('th')
          .text(function (column) { return column; })
          .attr("id", "fortablecenter");

      // create a row for each object in the data
      var rows = tbody.selectAll('tr')
        .data(tabledata)
        .enter()
        .append('tr');

      // create a cell in each row for each column
      var cells = rows.selectAll('td')
        .data(function (row) {
          return columns.map(function (column) {
            return {column: column, value: row[column]};
          });
        })
        .enter()
        .append('td')
          .text(function (d) { return d.value; })
          .attr("width", tablewidth)
          .attr("id", "fortablecenter")
        .on("mouseover", async function(d, i) {
          console.log("tablehover");
          d3.select(this)
            .transition()
            .duration(100)
            .attr('r', 10)
            .style('background-color', "yellow")
          var g_stack = document.getElementById("stacks");
          mouseoverrelations(d['column'], this.innerHTML, g_stack);          
        })
        .on("mouseout", function() {
          d3.selectAll("line").remove();
          d3.selectAll(".highlightrects").remove();
          d3.select(this)
            .transition()
            .duration(100)
            .attr('r', 10)
            .style('background-color', "white")
        });
    }
    

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

    function blendRGBColors(c0, c1, p) {
      var f=c0.split(","),t=c1.split(","),R=parseInt(f[0].slice(4)),G=parseInt(f[1]),B=parseInt(f[2]);
      return "rgb("+(Math.round((parseInt(t[0].slice(4))-R)*p)+R)+","+(Math.round((parseInt(t[1])-G)*p)+G)+","+(Math.round((parseInt(t[2])-B)*p)+B)+")";
    }

    function tablehighlight(attr_name, attr_val, color){
      var tableattrid = attr_name+"-table";
      var t = document.getElementById(String(tableattrid));
      var tds = t.getElementsByTagName("td");
      for (var b=0; b < tds.length; b++){
        if(tds[b].innerHTML == attr_val){
          tds[b].setAttribute("style", "background-color: "+color)
        }
      }
    }

    var puttingthefilter = function(talal, tempdict) {
      talal.vis.params.fpc.putfilters(tempdict);
    }.bind(null, this)

    async function mouseoverrelations(attr_name, attr_val, allthenodes) {
      const hp = new HoverProcessor(visData);
      var relations = [];

      await hp.getrelations(attr_name, attr_val).then(function(result) {
        relations = result;
      });

      console.log(relations);

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

              if (Number(relation_count) != 0 && String(relation_count) != "NaN"){
                console.log(relation_count);
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

    
    return new Promise(resolve => {
      resolve('when done rendering');
    });
  }
};

export { InsightVisualizationProvider };