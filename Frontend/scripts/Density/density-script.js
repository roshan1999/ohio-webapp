function createDensityChart(data, parentDiv, isUpdate) {

    if (parentDiv == "tempId" && isUpdate) {
        addDensityFilters();
        addDensityLegends();
    }

    function kernelDensityEstimator(kernel, X) {
        return function (V) {
            return X.map(function (x) {
                return [x, d3.mean(V, function (v) { return kernel(x - v); })];
            });
        };
    }

    function kernelEpanechnikov(k) {
        return function (v) {
            return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
        };
    }

    const margin = { top: 20, right: 20, bottom: 10, left: 30 };

    var density_div = d3.select("#" + parentDiv);
    var width = +density_div.style("width").replace("px", "") * 0.99 - margin.left - margin.right;
    var height = +density_div.style("height").replace("px", "") * 0.99 - margin.bottom - margin.top;

    const svg = d3.select("#chart_svg_" + parentDiv)
        .attr("width", width)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.bottom})`);
    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => +d.hourlyRate)])
        .range([0, width]);


    const y = d3.scaleLinear()
        .range([height, 0])

    svg.append("g")
        .call(d3.axisLeft(y));

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    let kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(40))
    var bachelorData = data.filter(d => d.educationRequirement == 'Bachelors')
    var graduateData = data.filter(d => d.educationRequirement == 'Graduate')
    var highSchoolData = data.filter(d => d.educationRequirement == 'HighSchoolOrCollege')
    var lowData = data.filter(d => d.educationRequirement == "Low")

    let densityBach = kde(bachelorData.map(function (d) { return d.hourlyRate; }))
    let densityGrad = kde(graduateData.map(function (d) { return d.hourlyRate; }))
    let densityHigh = kde(highSchoolData.map(function (d) { return d.hourlyRate; }))
    let densityLow = kde(lowData.map(function (d) { return d.hourlyRate; }))

    var max = 0
    max = Math.max(max, d3.max(densityBach, d => d[1]))
    max = Math.max(max, d3.max(densityGrad, d => d[1]))
    max = Math.max(max, d3.max(densityHigh, d => d[1]))
    max = Math.max(max, d3.max(densityLow, d => d[1]))

    y.domain([0, max])

    var curveBach = svg
        .append('g')
        .attr('class', 'bach')
        .append("path")
        .attr("class", "mypath")
        .datum(densityBach)
        .attr("fill", "red")
        .attr("opacity", ".8")
        .attr("stroke", "#000")
        .attr("stroke-width", 1)
        .attr("stroke-linejoin", "round")
        .attr("d", d3.line()
            .curve(d3.curveBasis)
            .x(function (d) { return x(d[0]); })
            .y(function (d) { return y(d[1]); })
        );

    var curveGrad = svg
        .append('g')
        .append("path")
        .attr("class", "mypath")
        .datum(densityGrad)
        .attr("fill", "blue")
        .attr("opacity", ".8")
        .attr("stroke", "#000")
        .attr("stroke-width", 1)
        .attr("stroke-linejoin", "round")
        .attr("d", d3.line()
            .curve(d3.curveBasis)
            .x(function (d) { return x(d[0]); })
            .y(function (d) { return y(d[1]); })
        );

    var curveHigh = svg
        .append('g')
        .append("path")
        .attr("class", "mypath")
        .datum(densityHigh)
        .attr("fill", "green")
        .attr("opacity", ".8")
        .attr("stroke", "#000")
        .attr("stroke-width", 1)
        .attr("stroke-linejoin", "round")
        .attr("d", d3.line()
            .curve(d3.curveBasis)
            .x(function (d) { return x(d[0]); })
            .y(function (d) { return y(d[1]); })
        );

    var curveLow = svg
        .append('g')
        .append("path")
        .attr("class", "mypath")
        .datum(densityLow)
        .attr("fill", "yellow")
        .attr("opacity", ".8")
        .attr("stroke", "#000")
        .attr("stroke-width", 1)
        .attr("stroke-linejoin", "round")
        .attr("d", d3.line()
            .curve(d3.curveBasis)
            .x(function (d) { return x(d[0]); })
            .y(function (d) { return y(d[1]); })
        );

    // svg.append("circle").attr("cx", 350).attr("cy", 30).attr("r", 6).style("fill", "red")
    // svg.append("circle").attr("cx", 350).attr("cy", 60).attr("r", 6).style("fill", "blue")
    // svg.append("circle").attr("cx", 350).attr("cy", 90).attr("r", 6).style("fill", "green")
    // svg.append("circle").attr("cx", 350).attr("cy", 120).attr("r", 6).style("fill", "yellow")

    // svg.append("text").attr("x", 360).attr("y", 30).text("Bachelors").style("font-size", "15px").style('cursor', 'pointer').attr("alignment-baseline", "middle").on('click', () => { })
    // svg.append("text").attr("x", 360).attr("y", 60).text("Graduate").style("font-size", "15px").attr("alignment-baseline", "middle")
    // svg.append("text").attr("x", 360).attr("y", 90).text("High School").style("font-size", "15px").attr("alignment-baseline", "middle")
    // svg.append("text").attr("x", 360).attr("y", 120).text("Low").style("font-size", "15px").attr("alignment-baseline", "middle")

    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + 40)
        .text("Hourly Wage");

    svg.append("text")
        .attr("text-anchor", "end")
        .attr("y", -50)
        .attr("x", -20)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Density");

    function updateData(isUpdate) {
        if (parentDiv == "tempId") {
            var value = document.getElementById('minWage').value
            var url = new URL('http://127.0.0.1:5000/densityPlot')
            const date = getCalendarDates()
            url.searchParams.append('min_wage', value)
            url.searchParams.append('start_date', date.start);
            url.searchParams.append('end_date', date.end);
            axios.get(url).then(values => {
                data = values.data

                bachelorData = data.filter(d => d.educationRequirement == 'Bachelors')
                graduateData = data.filter(d => d.educationRequirement == 'Graduate')
                highSchoolData = data.filter(d => d.educationRequirement == 'HighSchoolOrCollege')
                lowData = data.filter(d => d.educationRequirement == "Low")

                densityBach = kde(bachelorData.map(function (d) { return d.hourlyRate; }))
                densityGrad = kde(graduateData.map(function (d) { return d.hourlyRate; }))
                densityHigh = kde(highSchoolData.map(function (d) { return d.hourlyRate; }))
                densityLow = kde(lowData.map(function (d) { return d.hourlyRate; }))

                var max = 0
                max = Math.max(max, d3.max(densityBach, d => isNaN(d[1]) ? 0 : d[1]))
                max = Math.max(max, d3.max(densityGrad, d => isNaN(d[1]) ? 0 : d[1]))
                max = Math.max(max, d3.max(densityHigh, d => isNaN(d[1]) ? 0 : d[1]))
                max = Math.max(max, d3.max(densityLow, d => isNaN(d[1]) ? 0 : d[1]))

                y.domain([0, max])

                curveBach
                    .datum(densityBach)
                    .transition()
                    .duration(1000)
                    .attr("d", d3.line()
                        .curve(d3.curveBasis)
                        .x(function (d) { return isNaN(y(d[1])) ? 0 : x(d[0]); })
                        .y(function (d) { return isNaN(y(d[1])) ? 0 : y(d[1]); })
                    );


                curveGrad
                    .datum(densityGrad)
                    .transition()
                    .duration(1000)
                    .attr("d", d3.line()
                        .curve(d3.curveBasis)
                        .x(function (d) { return isNaN(y(d[1])) ? 0 : x(d[0]); })
                        .y(function (d) { return isNaN(y(d[1])) ? 0 : y(d[1]); })
                    );

                curveHigh
                    .datum(densityHigh)
                    .transition()
                    .duration(1000)
                    .attr("d", d3.line()
                        .curve(d3.curveBasis)
                        .x(function (d) { return isNaN(y(d[1])) ? 0 : x(d[0]); })
                        .y(function (d) { return isNaN(y(d[1])) ? 0 : y(d[1]); })
                    );


                curveLow
                    .datum(densityLow)
                    .transition()
                    .duration(1000)
                    .attr("d", d3.line()
                        .curve(d3.curveBasis)
                        .x(function (d) { return isNaN(y(d[1])) ? 0 : x(d[0]); })
                        .y(function (d) { return isNaN(y(d[1])) ? 0 : y(d[1]); })
                    );
            })
        }
    }

    if (parentDiv == "tempId") {
        let filter_container = document.querySelector(".filter-container")
        // let newInner = document.createElement("div")
        // newInner.setAttribute("id", "")
        filter_container.innerHTML = `
    <h2 class="ternary-text-color">Filter options</h2>
    <label for="mySlider"> Bandwidth </label>
    <input type="range" name="mySlider" id='mySlider' min="10" max="100" value="50">
    <label for='minWage'>Minimum Wage per hour</label>
    <input type='number' name='minWage' id='minWage' value=5 />
    <button class="ternary-text-color primary-font" id='minWageButton'>Change Minimum Wage</button>
    `
        d3.select('#minWageButton').on('click', updateData)

        d3.select('#mySlider').on('change', (d) => {

            kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(document.getElementById('mySlider').value))
            densityBach = kde(bachelorData.map(function (d) { return d.hourlyRate; }))
            densityGrad = kde(graduateData.map(function (d) { return d.hourlyRate; }))
            densityHigh = kde(highSchoolData.map(function (d) { return d.hourlyRate; }))
            densityLow = kde(lowData.map(function (d) { return d.hourlyRate; }))

            var max = 0
            max = Math.max(max, d3.max(densityBach, d => isNaN(d[1]) ? 0 : d[1]))
            max = Math.max(max, d3.max(densityGrad, d => isNaN(d[1]) ? 0 : d[1]))
            max = Math.max(max, d3.max(densityHigh, d => isNaN(d[1]) ? 0 : d[1]))
            max = Math.max(max, d3.max(densityLow, d => isNaN(d[1]) ? 0 : d[1]))

            y.domain([0, max])

            curveBach
                .datum(densityBach)
                .transition()
                .duration(1000)
                .attr("d", d3.line()
                    .curve(d3.curveBasis)
                    .x(function (d) { return isNaN(y(d[1])) ? 0 : x(d[0]); })
                    .y(function (d) { return isNaN(y(d[1])) ? 0 : y(d[1]); })
                );

            curveGrad
                .datum(densityGrad)
                .transition()
                .duration(1000)
                .attr("d", d3.line()
                    .curve(d3.curveBasis)
                    .x(function (d) { return isNaN(y(d[1])) ? 0 : x(d[0]); })
                    .y(function (d) { return isNaN(y(d[1])) ? 0 : y(d[1]); })
                );

            curveHigh
                .datum(densityHigh)
                .transition()
                .duration(1000)
                .attr("d", d3.line()
                    .curve(d3.curveBasis)
                    .x(function (d) { return isNaN(y(d[1])) ? 0 : x(d[0]); })
                    .y(function (d) { return isNaN(y(d[1])) ? 0 : y(d[1]); })
                );

            curveLow
                .datum(densityLow)
                .transition()
                .duration(1000)
                .attr("d", d3.line()
                    .curve(d3.curveBasis)
                    .x(function (d) { return isNaN(y(d[1])) ? 0 : x(d[0]); })
                    .y(function (d) { return isNaN(y(d[1])) ? 0 : y(d[1]); })
                );

        })
    }

    return updateData;
}

function addDensityFilters() {
    //
    {/* <input type="range" name="mySlider" id='mySlider' min="10" max="100" value="50">
    <label for='minWage'>Minimum Wage per hour</label>
    <input type='number' name='minWage' id='minWage' value=5 />
    <button class="ternary-text-color primary-font" id='minWageButton'>Change Minimum Wage</button> */}
    let filter_container = document.querySelector(".filter-container")
    // let newInner = document.createElement("div")
    // newInner.setAttribute("id", "")
    filter_container.innerHTML = `
    <h2 class="ternary-text-color">Filter options</h2>
    <label for="mySlider"> Bandwidth </label>
    <input type="range" name="mySlider" id='mySlider' min="10" max="100" value="50">
    <label for='minWage'>Minimum Wage per hour</label>
    <input type='number' name='minWage' id='minWage' value=5 />
    <button class="ternary-text-color primary-font" id='minWageButton'>Change Minimum Wage</button>
    `
    // filter_container.appendChild(newInner)
}

function addDensityLegends(){
    let legend_container = document.querySelector(".legend-container")
    const remove_legend = document.querySelectorAll(".legend-options-container");
    for (let i = 0; i < remove_legend.length; i++) {
        remove_legend[i].remove();
    }
    const optionLength = 4;
    let legend_items = [
      `Bachelors`,
      `Graduate`,
      `High School`,
      `Low`
    ]
    
    legend_colors = ["red", "blue", "green", "yellow"]

    for (let i = 0; i < optionLength; i++) {
        const container = document.createElement("div");
        container.setAttribute("class", "legend-options-container");
        container.style.display = "inline-block";

        const circle = document.createElement("div");
        circle.style.width = "20px";
        circle.style.height = "20px";
        circle.style.borderRadius = "50%";
        circle.style.backgroundColor = legend_colors[i];
        circle.style.border = "1px solid black";
        circle.style.display = "inline-block";
        circle.style.marginLeft = "10px";
        container.appendChild(circle);

        const label = document.createElement("span");
        label.textContent = legend_items[i];
        label.style.marginLeft = "10px";
        container.appendChild(label);

      legend_container.appendChild(container)
    }
  }
