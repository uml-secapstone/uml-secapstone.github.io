document.addEventListener("DOMContentLoaded", function () {
    const width = 600, height = 400;
    const svg = d3.select("#network-visualization")
                  .append("svg")
                  .attr("width", width)
                  .attr("height", height);

    // Define Neural Network Structure
    const layers = [2, 5, 1]; // 2 input, 5 hidden, 1 output
    const neuronRadius = 20;
    const layerSpacing = width / (layers.length + 1);
    let neurons = [];

    // Create Neurons
    layers.forEach((count, layerIndex) => {
        let x = layerSpacing * (layerIndex + 1);
        for (let i = 0; i < count; i++) {
            let y = (height / (count + 1)) * (i + 1);
            neurons.push({ x, y, layer: layerIndex });
        }
    });

    // Create Connections
    let connections = [];
    neurons.forEach((neuronA, i) => {
        neurons.forEach((neuronB, j) => {
            if (neuronA.layer + 1 === neuronB.layer) {
                connections.push({ source: neuronA, target: neuronB, weight: Math.random() * 2 - 1 });
            }
        });
    });

    // Draw Connections
    let connectionLines = svg.selectAll("line")
        .data(connections)
        .enter().append("line")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y)
        .style("stroke", d => d.weight > 0 ? "blue" : "red")
        .style("stroke-width", d => Math.abs(d.weight) * 2);

    // Draw Neurons
    let neuronCircles = svg.selectAll("circle")
        .data(neurons)
        .enter().append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", neuronRadius)
        .style("fill", "#3498db");

    // Simulate Training
    document.getElementById("start-training").addEventListener("click", function () {
        setInterval(() => {
            // Update weights randomly
            connections.forEach(d => d.weight += (Math.random() - 0.5) * 0.1);

            // Animate connections based on weight change
            connectionLines.transition()
                .duration(500)
                .style("stroke-width", d => Math.abs(d.weight) * 2)
                .style("stroke", d => d.weight > 0 ? "blue" : "red");

            // Simulate neuron activation
            neuronCircles.transition()
                .duration(500)
                .style("fill", () => Math.random() > 0.5 ? "#e74c3c" : "#3498db");
        }, 1000);
    });
});
