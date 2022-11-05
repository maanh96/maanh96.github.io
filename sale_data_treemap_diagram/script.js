//Link to dataset
const DATASETS = {
    videogames: {
        TITLE: "Video Game Sales",
        DESCRIPTION: "Top 100 Most Sold Video Games Grouped by Platform",
        FILE_PATH:
            "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json"
    },
    movies: {
        TITLE: "Movie Sales",
        DESCRIPTION: "Top 100 Highest Grossing Movies Grouped By Genre",
        FILE_PATH:
            "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json"
    },
    kickstarter: {
        TITLE: "Kickstarter Pledges",
        DESCRIPTION:
            "Top 100 Most Pledged Kickstarter Campaigns Grouped By Category",
        FILE_PATH:
            "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json"
    }
};

// Set dataset
const DATASET = DATASETS[new URLSearchParams(window.location.search).get('data') || "videogames"];

//Update title and description
d3.select("#title")
    .append("text")
    .text(DATASET.TITLE);

d3.select("#description")
    .append("text")
    .text(DATASET.DESCRIPTION);

//Width and height
var w = 900;
var h = 460;
var padding = 20;

//Create SVG element
var svg = d3.select(".treemap")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

//Create tooltip
var tooltip = d3.select(".treemap")
    .append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden");


//Load data and create chart
d3.json(DATASET.FILE_PATH)
    .then(data => {

        //Set root
        var root = d3.hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => d3.descending(a.value, b.value));

        //Compute the treemap layout
        d3.treemap()
            .tile(d3.treemapSquarify)
            .size([w, h])
            .paddingInner(1)
            (root);

        //Create colorscale (20 colors in case there are more than 10 categories)
        var colorScale = d3.scaleOrdinal()
            .range(d3.shuffle(d3.range(1, 21).map(d => d3.interpolateSpectral((d - 1) / 19))));

        //Create nodes
        const node = svg.selectAll("g")
            .data(root.leaves())
            .join("g")
            .attr("transform", d => `translate(${d.x0},${d.y0})`);

        node.append("rect")
            .attr("fill", d => colorScale(d.data.category))
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("class", "tile")
            .attr("data-name", d => d.data.name)
            .attr("data-category", d => d.data.category)
            .attr("data-value", d => d.data.value);

        //Add label
        node.append("foreignObject")
            .attr("class", "tile-text")
            .attr("x", 4)
            .attr("y", 2)
            .attr("width", d => d.x1 - d.x0 - 8)
            .attr("height", d => d.y1 - d.y0 - 4)
            .append("xhtml:div")
            .append("div")
            .html(d => d.data.name)
            .style("text-align", "left")
            .style("font-size", "0.7em")
            .style("color", d => {
                var { r, g, b } = d3.color(colorScale(d.data.category))
                Y = 0.2126 * r + 0.7152 * g + 0.0722 * b
                return Y > 165 ? "#000" : "#fff"
            });

        node.on("mousemove", (event, d) => {
            tooltip.style("visibility", "visible")
                .text("Name: " + d.data.name + "\nCategory: " + d.data.category + "\nValue: " + d.data.value)
                .style("top", event.pageY - 60 + "px")
                .style("left", event.pageX + "px")
                .attr("data-value", d.data.value);
        })
            .on("mouseout", () => {
                tooltip.style("visibility", "hidden");
            });

        //Add legend
        var legend = d3.select("#legend")
            .append("svg")
            .attr("width", 550)
            .attr("height", 200)
            .selectAll("g")
            .data(new Set(root.leaves().map(d => d.data.category)))
            .join("g")
            .attr("transform", (d, i) => `translate(${(i % 4) * 150}, ${Math.floor(i / 4) * 40})`);

        legend.append("rect")
            .attr("class", "legend-item")
            .attr("fill", d => colorScale(d))
            .attr("width", 15)
            .attr("height", 15);

        legend.append("text")
            .attr("x", 20)
            .attr("y", 15)
            .text(d => d)
            .style("font-size", "0.8em");

    });