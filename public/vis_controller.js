const d3 = require('d3');
const d3_svg = require('d3-svg');

//https://github.com/53seven/d3-svg

class VisController {
  constructor(el, vis) {
    this.vis = vis;
    this.el = el;

    this.container = document.createElement('div');
    this.container.className = 'myvis-container-div';
    this.el.appendChild(this.container);
  }

  destroy() {
    this.el.innerHTML = '';
  }

  render(visData, status) {
    console.log("i am the visualizer");
    //console.log(visData['realdata']);
    //console.log(status);

    var rawdata = visData['realdata'];
    console.log(rawdata);
    if (rawdata != undefined && rawdata.length > 0){
      console.log("yassss");

      var datas = [];
      var vallist=[];

      rawdata.forEach(function (arrayItem) {
          var attr = arrayItem['key'];
          var refinedata0 = arrayItem['value']
          refinedata0.forEach(function (dataItem){
            var attr_val =  dataItem['key'];
            var doc_count = dataItem['doc_count'];
            vallist.push(dataItem['key']);
            var currentbar = {'attribute': attr};
            currentbar[attr_val] = doc_count;
            // currentbar['attribute'] = attr;
            // currentbar[attr_val] = doc_count;
            datas.push(currentbar);
            // datas.push({
            //   attribute: attr,
            //   attr_val: doc_count;
            // });
          });
          //datas.push(currentbar);
      });

      console.log(datas);

      this.container.innerHTML = '';
      const vizfiltDiv = document.createElement(`div`);
      vizfiltDiv.className = `myvis-div`;

      vizfiltDiv.setAttribute('style', `height: 700px; width:700px;`);

      var margin = {top: 20, right: 160, bottom: 35, left: 30};

      var width =960 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

      var svg = d3_svg.create(vizfiltDiv, width= width + margin.left + margin.right, height= height + margin.top + margin.bottom);

      svg.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


      /* Data in strings like it would be if imported from a csv */

      var data = [
        { year: "2006", redDelicious: "10", mcintosh: "15", oranges: "9", pears: "6" },
        { year: "2007", redDelicious: "12", mcintosh: "18", oranges: "9", pears: "4" },
        { year: "2008", redDelicious: "05", mcintosh: "20", oranges: "8", pears: "2" },
        { year: "2009", redDelicious: "01", mcintosh: "15", oranges: "5", pears: "4" },
        { year: "2010", redDelicious: "02", mcintosh: "10", oranges: "4", pears: "2" },
        { year: "2011", redDelicious: "03", mcintosh: "12", oranges: "6", pears: "3" },
        { year: "2012", redDelicious: "04", mcintosh: "15", oranges: "8", pears: "1" },
        { year: "2013", redDelicious: "06", mcintosh: "11", oranges: "9", pears: "4" },
        { year: "2014", redDelicious: "10", mcintosh: "13", oranges: "9", pears: "5" },
        { year: "2015", redDelicious: "16", mcintosh: "19", oranges: "6", pears: "9" },
        { year: "2016", redDelicious: "19", mcintosh: "17", oranges: "5", pears: "7" },
      ];

      console.log(data);

      //var parse = d3.time.format("%Y").parse;


      // Transpose the data into layers
      var dataset = d3.layout.stack()(vallist.map(function(vals) {//fruit
        return datas.map(function(d) {
          //console.log(d[vals]);
          return {x: d.attribute, y: +d[vals]};//return {x: parse(d.year), y: +d[fruit]};
        });
      }));


      // Set x, y and colors
      var x = d3.scale.ordinal()
        .domain(dataset[0].map(function(d) { return d.x; }))
        .rangeRoundBands([10, width-10], 0.02);

      var y = d3.scale.linear()
        .domain([0, d3.max(dataset, function(d) {  return d3.max(d, function(d) { return d.y0 + d.y; });  })])
        .range([height, 0]);

      var colors = ["b33040", "#d25c4d", "#f2b447", "#d9d574"];


      // Define and draw axes
      var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(5)
        .tickSize(-width, 0, 0)
        .tickFormat(function(d) { return d } );

      var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(function(d) { return d } );

      svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);


      // Create groups for each series, rects for each segment 
      var groups = svg.selectAll("g.cost")
        .data(dataset)
        .enter().append("g")
        .attr("class", "cost")
        .style("fill", function(d, i) { return colors[i]; });

      var rect = groups.selectAll("rect")
        .data(function(d) { return d; })
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(d.x); })
        .attr("y", function(d) { return y(d.y0 + d.y); })
        .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
        .attr("width", x.rangeBand())
        // .on("mouseover", function() { tooltip.style("display", null); })
        // .on("mouseout", function() { tooltip.style("display", "none"); })
        // .on("mousemove", function(d) {
        //   var xPosition = d3.mouse(this)[0] - 15;
        //   var yPosition = d3.mouse(this)[1] - 25;
          // tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
          // tooltip.select("text").text(d.y);
        // });


      // Draw legend
      // var legend = svg.selectAll(".legend")
      //   .data(colors)
      //   .enter().append("g")
      //   .attr("class", "legend")
      //   .attr("transform", function(d, i) { return "translate(30," + i * 19 + ")"; });
       
      // legend.append("rect")
      //   .attr("x", width - 18)
      //   .attr("width", 18)
      //   .attr("height", 18)
      //   .style("fill", function(d, i) {return colors.slice().reverse()[i];});
       
      // legend.append("text")
      //   .attr("x", width + 5)
      //   .attr("y", 9)
      //   .attr("dy", ".35em")
      //   .style("text-anchor", "start")
      //   .text(function(d, i) { 
      //     switch (i) {
      //       case 0: return "Anjou pears";
      //       case 1: return "Naval oranges";
      //       case 2: return "McIntosh apples";
      //       case 3: return "Red Delicious apples";
      //     }
      //   });


      // Prep the tooltip bits, initial display is hidden
      // var tooltip = svg.append("g")
      //   .attr("class", "tooltip")
      //   .style("display", "none");
          
      // tooltip.append("rect")
      //   .attr("width", 30)
      //   .attr("height", 20)
      //   .attr("fill", "white")
      //   .style("opacity", 0.5);

      // tooltip.append("text")
      //   .attr("x", 15)
      //   .attr("dy", "1.2em")
      //   .style("text-anchor", "middle")
      //   .attr("font-size", "12px")
      //   .attr("font-weight", "bold");

      this.container.appendChild(vizfiltDiv);

      //vizfiltDiv.setAttribute('style', `font-size: ${this.vis.params.fontSize}pt`);

      // this.container.innerHTML = '';

      // const testDiv = document.createElement(`div`);
      // testDiv.className = `myvis-test-div`;
      // testDiv.innerHTML = `<b>Query Data:</b> ${visData}`;
      // testDiv.setAttribute('style', `font-size: ${this.vis.params.fontSize}pt`);

      // this.container.appendChild(testDiv);

      // const table = visData.tables[0];
      // const metrics = [];
      // let bucketAgg;

      // table.columns.forEach((column, i) => {
      //   // we have multiple rows … first column is a bucket agg
      //   if (table.rows.length > 1 && i == 0) {
      //     bucketAgg = column.aggConfig;
      //     return;
      //   }

      //   table.rows.forEach(row => {
      //     const value = row[i];
      //     metrics.push({
      //       title: bucketAgg ? `${row[0]} ${column.title}` : column.title,
      //       value: row[i],
      //       formattedValue: column.aggConfig ? column.aggConfig.fieldFormatter('text')(value) : value,
      //       bucketValue: bucketAgg ? row[0] : null,
      //       aggConfig: column.aggConfig
      //     });
      //   });
      // });

      // metrics.forEach(metric => {
      //   const metricDiv = document.createElement(`div`);
      //   metricDiv.className = `myvis-metric-div`;
      //   metricDiv.innerHTML = `<b>${metric.title}:</b> ${metric.formattedValue}`;
      //   metricDiv.setAttribute('style', `font-size: ${this.vis.params.fontSize}pt`);
      //   metricDiv.addEventListener('click', () => {
      //     if (!bucketAgg) return;
      //     const filter = bucketAgg.createFilter(metric.bucketValue);
      //     this.vis.API.queryFilter.addFilters(filter);
      //   });

      //   this.container.appendChild(metricDiv);
      // });

    }
    return new Promise(resolve => {
      resolve('when done rendering');
    });
  }
};

export { VisController };