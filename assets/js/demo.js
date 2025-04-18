let model;
let chart;
let trainingActive = false;
let networkCanvas = document.getElementById('networkCanvas');
let ctx = networkCanvas.getContext('2d');
let layerSizes = [2, 4, 1]; // Initial network architecture

// Initialize the loss chart
function initChart() {
    chart = new Chart(document.getElementById('lossChart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Loss',
                data: [],
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
}

// Adds a new layer with 3 neurons (default)
function addLayer() {
    layerSizes.splice(layerSizes.length - 1, 0, 3); // Insert before output layer
    updateLayerControls();
    drawNetwork();
}

// Removes last hidden layer
function removeLayer() {
    if (layerSizes.length > 2) { // Keep input & output layers
        layerSizes.splice(layerSizes.length - 2, 1);
        updateLayerControls();
        drawNetwork();
    }
}

// Updates UI layer controls dynamically
function updateLayerControls() {
    const controlPanel = document.getElementById('layerControls');
    controlPanel.innerHTML = '';
    layerSizes.forEach((size, index) => {
        let label = index === 0 ? 'Input' : index === layerSizes.length - 1 ? 'Output' : `Hidden ${index}`;
        controlPanel.innerHTML += `<div>${label}: ${size} neurons</div>`;
    });
}

// Draws the neural network with animations
function drawNetwork(activeLayer = -1) {
    ctx.clearRect(0, 0, networkCanvas.width, networkCanvas.height);
    const layerPadding = 100;
    const neuronRadius = 15;
    const colors = ['#ff7675', '#74b9ff', '#55efc4'];

    layerSizes.forEach((neurons, layerIdx) => {
        const xPos = layerPadding + (networkCanvas.width - 2 * layerPadding) * (layerIdx / (layerSizes.length - 1));
        const ySpacing = networkCanvas.height / (neurons + 1);

        for (let i = 0; i < neurons; i++) {
            ctx.beginPath();
            ctx.arc(xPos, ySpacing * (i + 1), neuronRadius, 0, Math.PI * 2);
            ctx.fillStyle = layerIdx === activeLayer ? 'yellow' : colors[layerIdx % colors.length];
            ctx.fill();
            ctx.stroke();
        }

        if (layerIdx > 0) {
            const prevXPos = layerPadding + (networkCanvas.width - 2 * layerPadding) * ((layerIdx - 1) / (layerSizes.length - 1));
            const prevYSpacing = networkCanvas.height / (layerSizes[layerIdx - 1] + 1);
            for (let i = 0; i < layerSizes[layerIdx - 1]; i++) {
                for (let j = 0; j < neurons; j++) {
                    ctx.beginPath();
                    ctx.moveTo(prevXPos + neuronRadius, prevYSpacing * (i + 1));
                    ctx.lineTo(xPos - neuronRadius, ySpacing * (j + 1));
                    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
                    ctx.stroke();
                }
            }
        }
    });
}

// Generates synthetic training data
function generateData() {
    const numSamples = 1000;
    const xs = tf.randomUniform([numSamples, 2], -1, 1);
    const ys = xs.sum(1).greater(0.5).cast('float32');
    return { xs, ys };
}

// Animates network layers during training
async function animateLayers(epoch) {
    for (let i = 0; i < layerSizes.length; i++) {
        drawNetwork(i);
        await new Promise(resolve => setTimeout(resolve, 200));
    }
}

// Creates the TensorFlow.js model
function createModel() {
    model = tf.sequential();
    model.add(tf.layers.dense({
        units: layerSizes[0],
        inputShape: [2],
        activation: 'relu'
    }));

    for (let i = 1; i < layerSizes.length - 1; i++) {
        model.add(tf.layers.dense({
            units: layerSizes[i],
            activation: 'relu'
        }));
    }

    model.add(tf.layers.dense({
        units: layerSizes[layerSizes.length - 1],
        activation: 'sigmoid'
    }));

    model.compile({
        optimizer: tf.train.adam(parseFloat(document.getElementById('learningRate').value)),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
    });
}

// Processes input features (only uses first two for now)
function processFeatures(xs) {
    return xs;
}

// Model training
async function trainModel() {
    const { xs, ys } = generateData();
    const processedXs = processFeatures(xs);

    await model.fit(processedXs, ys, {
        epochs: parseInt(document.getElementById('epochs').value),
        batchSize: parseInt(document.getElementById('batchSize').value),
        callbacks: {
            onEpochEnd: async (epoch, logs) => {
                console.log(`Epoch ${epoch}: Loss = ${logs.loss}`);
                chart.data.labels.push(epoch);
                chart.data.datasets[0].data.push(logs.loss);
                chart.update();
                await animateLayers(epoch);
            }
        }
    });
}

// Starts training
async function startTraining() {
    if (trainingActive) return;
    trainingActive = true;
    chart.data.labels = [];
    chart.data.datasets[0].data = [];
    chart.update();

    createModel();
    await trainModel();
    trainingActive = false;
}

// Initialize
window.onload = () => {
    initChart();
    updateLayerControls();
    drawNetwork();
};
