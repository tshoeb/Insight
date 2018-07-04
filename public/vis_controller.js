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
    //console.log(visData['realdata']);
    //console.log(status);

    var rawdata = visData['realdata'];
    console.log(rawdata);
    if (rawdata != undefined && rawdata.length > 0){
      console.log("yassss");

      var data = [];
      var xData=[];

      rawdata.forEach(function (arrayItem) {
          var attr = arrayItem['key'];
          var refinedata0 = arrayItem['value']
          refinedata0.forEach(function (dataItem){
            var attr_val =  dataItem['key'];
            var doc_count = dataItem['doc_count'];
            xData.push(dataItem['key']);
            var currentbar = {'attribute': attr};
            currentbar[attr_val] = doc_count;
            data.push(currentbar);
          });
      });

      console.log(data);
      console.log(xData);

      this.container.innerHTML = '';
      const vizfiltDiv = document.createElement(`div`);
      vizfiltDiv.className = `myvis-div`;

      vizfiltDiv.setAttribute('style', `height: 700px; width:700px;`);

      var margin = {top: 20, right: 50, bottom: 30, left: 0},
            width = 400 - margin.left - margin.right,
            height = 900- margin.top - margin.bottom;

      // var x = d3.scale.ordinal()
      //         .rangeRoundBands([0, width], .35);

      // var y = d3.scale.linear()
      //         .rangeRound([height, 0]);

      // var color = d3.scale.category20();

      // var xAxis = d3.svg.axis()
      //         .scale(x)
      //         .orient("bottom");

      var svg = d3_svg.create(vizfiltDiv, {width: width + margin.left + margin.right, height: height + margin.top + margin.bottom});

      // svg.append("svg")
      //     .attr("width", width + margin.left + margin.right)
      //     .attr("height", height + margin.top + margin.bottom)
      //    .append("g")
      //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var series = d3.stack()
        .keys(xData)
        .offset(d3.stackOffsetDiverging)
        (data);

      // var svg = d3.select("svg"),
      //     margin = {top: 20, right: 30, bottom: 30, left: 60},
      //     width = +svg.attr("width"),
      //     height = +svg.attr("height");

      var x = d3.scaleBand()
          .domain(data.map(function(d) { return d.attribute; }))
          .rangeRound([margin.left, width - margin.right])
          .padding(0.1);

      var y = d3.scaleLinear()
          .domain([d3.min(series, stackMin), d3.max(series, stackMax)])
          .rangeRound([height - margin.bottom, margin.top]);

      var z = d3.scaleOrdinal(d3.schemeCategory10);

      svg.append("g")
        .selectAll("g")
        .data(series)
        .enter().append("g")
          .attr("fill", function(d) { return z(d.key); })
        .selectAll("rect")
        .data(function(d) { return d; })
        .enter().append("rect")
          .attr("width", x.bandwidth)
          .attr("x", function(d) { return x(d.data.attribute); })
          .attr("y", function(d) { return y(d[1]); })
          .attr("height", function(d) { return y(d[0]) - y(d[1]); })

      svg.append("g")
          .attr("transform", "translate(0," + y(0) + ")")
          .call(d3.axisBottom(x));

      svg.append("g")
          .attr("transform", "translate(" + margin.left + ",0)")
          .call(d3.axisLeft(y));

      function stackMin(serie) {
        return d3.min(serie, function(d) { return d[0]; });
      }

      function stackMax(serie) {
        return d3.max(serie, function(d) { return d[1]; });
      }

      //var svgRoot = this.el.getElementById("myvis-container-div");

      //var div = d3.select(svgRoot);

      // var dataIntermediate = xData.map(function (c) {
      //     return data.map(function (d) {
      //         console.log(d.attribute);
      //         return {x: d.attribute, y: d[c]};
      //     });
      // });

      // var dataStackLayout = d3.layout.stack()(dataIntermediate);

      // x.domain(dataStackLayout[0].map(function (d) {
      //     return d.x;
      // }));

      // y.domain([0,
      //     d3.max(dataStackLayout[dataStackLayout.length - 1],
      //             function (d) { 
      //               //console.log(d.y);
      //               return d.y0 + d.y;
      //             })
      //     ])
      //   .nice();

      // console.log(svg.selectAll(".stack"));

      // var layer = svg.selectAll(".stack")
      //         .data(dataStackLayout)
      //         .enter().append("g")
      //         .attr("class", "stack")
      //         .style("fill", function (d, i) {
      //             return color(i);
      //         });

      // layer.selectAll("rect")
      //         .data(function (d) {
      //             return d;
      //         })
      //         .enter().append("rect")
      //         .attr("x", function (d) {
      //             return x(d.x);
      //         })
      //         .attr("y", function (d) {
      //             return y(d.y + d.y0);
      //         })
      //         .attr("height", function (d) {
      //             return y(d.y0) - y(d.y + d.y0);
      //         })
      //         .attr("width", x.rangeBand());

      // svg.append("g")
      //     .attr("class", "axis")
      //     .attr("transform", "translate(0," + height + ")")
      //    .call(xAxis);

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

      //this.container.appendChild(metricDiv);
      // });

    }
    return new Promise(resolve => {
      resolve('when done rendering');
    });
  }
};

export { VisController };