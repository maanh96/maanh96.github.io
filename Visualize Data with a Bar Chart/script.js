//Width and height
var w = 800;
var h = 400;

//Create SVG element
var svg = d3.select(".barChart")
    .append("svg")
    .attr("width", w + 100)
    .attr("height", h + 60);

//For converting strings to date
var parseTime = d3.timeParse("%Y-%m-%d");
var formatTime = d3.timeFormat("%Y Q%q");
//To match with test 7
var formatTime2 = d3.timeFormat("%Y-%m-%d");

//Create tooltip
var tooltip = d3.select(".barChart")
    .append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden");

d3.json('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json')
    .then(data => {
        var dataset = data.data

        //Convert string to date
        dataset.forEach((d) => {
            d[0] = parseTime(d[0])
        });

        //Create time/linear scale
        var xScale = d3.scaleTime()
            .domain([d3.min(dataset, (d) => d[0]), d3.max(dataset, (d) => d[0])])
            .range([0, w]);

        var yScale = d3.scaleLinear()
            .domain([0, d3.max(dataset, (d) => d[1])])
            .range([h, 0]);

        //Draw graph
        svg.selectAll("rect")
            .data(dataset)
            .enter()
            .append("rect")
            .attr("x", (d) => (xScale(d[0])))
            .attr("y", (d) => (yScale(d[1])))
            .attr("width", (w / dataset.length))
            .attr("height", (d) => (h - yScale(d[1])))
            .attr("class", "bar")
            .attr("transform", "translate(60, 0)")
            .attr("data-date", (d) => formatTime2(d[0]))
            .attr("data-gdp", (d) => d[1])
            .on("mouseover", function (event, d) {
                const [x, y] = d3.pointer(event);
                tooltip.style("visibility", "visible")
                    .text(formatTime(d[0]) + "\n$" + d[1] + " Billion")
                    .style("top", (y) - 40 + "px")
                    .style("left", (x) + "px")
                    .attr("data-date", formatTime2(d[0]));
            })
            .on("mouseout", function () {
                tooltip.style("visibility", "hidden");
            });

        //Add axes
        var xAxis = d3.axisBottom(xScale);
        svg.append("g")
            .attr("id", "x-axis")
            .attr("transform", "translate(60, " + h + ")")
            .call(xAxis);

        var yAxis = d3.axisLeft(yScale);
        svg.append("g")
            .attr("id", "y-axis")
            .attr("transform", "translate(60, 0)")
            .call(yAxis);

    }); 
