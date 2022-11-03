//Link to dataset
var url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

//Width and height
var w = 900;
var h = 460;
var padding = 20;

//Create SVG element
var svg = d3.select(".heatmap")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

//For converting strings to date
var parseTime = d3.timeParse("%m");
var formatTime = d3.timeFormat("%B");

//Create tooltip
var tooltip = d3.select(".heatmap")
    .append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden");

//Load data and create chart
d3.json(url)
    .then(data => {
        //Convert string to time
        data.monthlyVariance.forEach(d => d.month = parseTime(d.month));

        //Add subtitle
        var subtitle = d3.select("#subtitle")
            .append("text")
            .attr("id", "description")
            .text(d3.min(data.monthlyVariance, d => d.year)
                + " - " + d3.max(data.monthlyVariance, d => d.year)
                + ": base temperature "
                + data.baseTemperature + "°C");

        //Create scale functions
        var xScale = d3.scaleBand()
            .domain(data.monthlyVariance.map(d => d.year))
            .range([padding * 3, w - padding * 2]);

        var yScale = d3.scaleBand()
            .domain(data.monthlyVariance.map(d => d.month))
            .range([padding, h - padding]);

        var colorScale = d3.scaleLinear()
            .domain(d3.extent(data.monthlyVariance, d => d.variance))
            .range([1, 0]);

        //Create axes
        var xAxis = d3.axisBottom(xScale)
            .tickValues(xScale.domain().filter(d => (d % 10 === 0)));
        svg.append("g")
            .attr("id", "x-axis")
            .attr("transform", "translate(0, " + (h - padding) + ")")
            .call(xAxis);

        var yAxis = d3.axisLeft(yScale)
            .tickFormat(formatTime);
        svg.append("g")
            .attr("id", "y-axis")
            .attr("transform", "translate(" + (padding * 3) + ", 0)")
            .call(yAxis);

        //Create map
        svg.selectAll(".map")
            .data(data.monthlyVariance)
            .enter()
            .append("rect")
            .attr("class", "cell")
            .attr("data-month", d => d3.timeFormat("%m")(d.month) - 1)
            .attr("data-year", d => d.year)
            .attr("data-temp", d => (data.baseTemperature + d.variance))
            .attr("x", d => xScale(d.year))
            .attr("y", d => yScale(d.month))
            .attr('width', d => xScale.bandwidth(d.year))
            .attr('height', d => yScale.bandwidth(d.month))
            .attr("fill", d => d3.interpolateRdYlBu(colorScale(d.variance)))
            .on("mouseover", (event, d) => {
                tooltip.style("visibility", "visible")
                    .text(formatTime(d.month) + " " + d.year + "\nTemp: " + d3.format('.2f')(data.baseTemperature + d.variance) + "°C\nVar: " + d3.format('.2f')(d.variance) + "°C")
                    .style("top", event.pageY - 60 + "px")
                    .style("left", event.pageX + "px")
                    .attr("data-year", d.year);
            })
            .on("mouseout", () => {
                tooltip.style("visibility", "hidden");
            });

        //Add legend
        var legend = d3.select(".legend-container")
            .append("svg")
            .attr("width", w / 2)
            .attr("height", 60)
            .attr("id", "legend");

        legend.selectAll("rect")
            .data(d3.schemeRdYlBu[10].reverse())
            .enter()
            .append("rect")
            .attr("x", (d, i) => 80 + i * 30)
            .attr("y", 20)
            .attr("width", 30)
            .attr("height", 15)
            .style("fill", d => d);

        var legendX = d3.scaleLinear()
            .domain(d3.extent(data.monthlyVariance, d => data.baseTemperature + d.variance))
            .range([0, 299]);

        var minTemp = data.baseTemperature + d3.min(data.monthlyVariance, d => d.variance);
        var maxTemp = data.baseTemperature + d3.max(data.monthlyVariance, d => d.variance);
        var step = (maxTemp - minTemp) / 10

        var legendxAxis = d3.axisBottom(legendX)
            .tickValues(d3.range(minTemp, (maxTemp + step), step))
            .tickFormat(d3.format('.1f'));

        legend.append("g")
            .attr("transform", "translate(80, 35)")
            .call(legendxAxis);

    })

