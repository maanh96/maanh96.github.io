//Link to dataset
var eduurl = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
var countyurl = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

//Width and height
var w = 975;
var h = 610;
var padding = 20;

//Create SVG element
var svg = d3.select(".map")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

//Create tooltip
var tooltip = d3.select(".map")
    .append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden");

//Create path
const path = d3.geoPath();

//Load data
Promise.all([d3.json(eduurl), d3.json(countyurl)])
    .then(([edu, county]) => {

        //Construct scale
        var colorScale = d3.scaleQuantize()
            .domain(d3.extent(edu, d => d.bachelorsOrHigher))
            .range(d3.schemeBlues[9]);

        //Create customs function to match county data with edu
        function eduMatch(d) {
            var result = edu.filter(e => e.fips === d.id);
            return result[0];
        };

        //Draw the map
        svg.append("g")
            .attr("transform", "translate(0, 15)")
            .selectAll("path")
            .data(topojson.feature(county, county.objects.counties).features)
            .join("path")
            .attr("d", path)
            .attr("fill", d => colorScale(eduMatch(d).bachelorsOrHigher))
            .attr("class", "county")
            .attr("data-fips", d => d.id)
            .attr("data-education", d => eduMatch(d).bachelorsOrHigher)
            .on("mouseover", (event, d) => {
                tooltip.style("visibility", "visible")
                    .text(eduMatch(d).area_name + ", " + eduMatch(d).state + ": " + eduMatch(d).bachelorsOrHigher + "%")
                    .style("top", event.pageY - 40 + "px")
                    .style("left", event.pageX + "px")
                    .attr("data-education", eduMatch(d).bachelorsOrHigher);
            })
            .on("mouseout", () => {
                tooltip.style("visibility", "hidden");
            });

        //Add border
        svg.append("path")
            .attr("pointer-events", "none")
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round")
            .attr("d", path(topojson.mesh(county, county.objects.states, (a, b) => a !== b)));

        //Create legend
        var legend = svg.append('g')
            .attr('class', 'key')
            .attr('id', 'legend')
            .attr('transform', 'translate(550, 5)');

        //legend color bar
        legend.selectAll("rect")
            .data(d3.schemeBlues[9])
            .join("rect")
            .attr("x", (d, i) => i * 30)
            .attr("y", 10)
            .attr("width", 30)
            .attr("height", 15)
            .style("fill", d => d);

        //legend text
        x = d3.scaleLinear()
            .domain(colorScale.domain())
            .range([0, 270]);

        var minValue = d3.min(edu, d => d.bachelorsOrHigher);
        var maxValue = d3.max(edu, d => d.bachelorsOrHigher);
        var step = (maxValue - minValue) / 9;

        legend.append("g")
            .attr("transform", "translate(0, 25)")
            .call(d3.axisBottom(x)
                .tickValues(d3.range(minValue, (maxValue + step), step))
                .tickFormat(x => d3.format(".0f")(x) + "%")
                .tickSize(0)
            )
            .call(g => g.select(".domain").remove());

    })
    .catch(err => console.log(err));

