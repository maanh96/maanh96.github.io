//Link to dataset
var url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

//Width and height
var w = 900;
var h = 460;
var padding = 20;

//Create SVG element
var svg = d3.select(".scatterplot")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

//For converting strings to date
var parseTime = d3.timeParse("%M:%S");
var formatTime = d3.timeFormat("%M:%S");

//Create tooltip
var tooltip = d3.select(".scatterplot")
    .append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden");

//Create color
var color = d3.scaleOrdinal(d3.schemeCategory10);

//Load data and create scatterplot
d3.json(url)
    .then(data => {
        //Convert string to time
        data.forEach(d => {
            d.Time = parseTime(d.Time);
        });

        //Create scale functions
        var xScale = d3.scaleLinear()
            .domain([d3.min(data, d => d.Year) - 1, d3.max(data, d => d.Year) + 1])
            .range([padding * 4, w - padding * 2]);

        var yScale = d3.scaleTime()
            .domain([d3.max(data, d => d.Time), d3.min(data, d => d.Time)])
            .range([h - padding, padding]);

        //Create axes
        var xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
        svg.append("g")
            .attr("id", "x-axis")
            .attr("transform", "translate(0, " + (h - padding) + ")")
            .call(xAxis);
        svg.append("text")
            .attr("transform", "rotate(-90 20 " + h / 2 + ")")
            .attr("x", 20)
            .attr("y", h / 2)
            .attr("text-anchor", "middle")
            .text("Time (minutes)");

        var yAxis = d3.axisLeft(yScale).tickFormat(formatTime);
        svg.append("g")
            .attr("id", "y-axis")
            .attr("transform", "translate(" + (padding * 4) + ", 0)")
            .call(yAxis);

        //Create dot
        svg.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("r", 6)
            .attr("cx", d => xScale(d.Year))
            .attr("cy", d => yScale(d.Time))
            .attr("data-xvalue", d => d.Year)
            .attr("data-yvalue", d => d.Time.toISOString())
            .style("fill", d => color(d.Doping !== ""))
            .on("mouseover", function (event, d) {
                tooltip.style("visibility", "visible")
                    .text(d.Name + ": " + d.Nationality + "\nYear: " + d.Year + ", Time: " + formatTime(d.Time) + (d.Doping ? '\n\n' + d.Doping : ""))
                    .style("top", event.pageY - 30 + "px")
                    .style("left", event.pageX + "px")
                    .attr("data-year", d.Year);
            })
            .on("mouseout", function () {
                tooltip.style("visibility", "hidden");
            });

        //Add legend
        var legend = svg.selectAll("#legend")
            .data(color.domain())
            .enter()
            .append("g")
            .attr("id", "legend")
            .attr("transform", (d, i) => "translate(" + (w - padding * 2) + ", " + (h / 2 - padding / 2 + i * padding) + ")");

        legend.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", color);

        legend.append("text")
            .attr("dx", "-0.5em")
            .attr('dy', '0.55em')
            .attr("text-anchor", "end")
            .text((d) => d ? "Riders with doping allegations" : "No doping allegations");

    });