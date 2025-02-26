document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("classificationCanvas");
    const ctx = canvas.getContext("2d");

    let model;
    let learningRate = 0.03;
    let hiddenNeurons = 5;
    let activationFunction = "relu";

    // Event Listeners for user controls
    document.getElementById("learningRate").addEventListener("input", function () {
        learningRate = parseFloat(this.value);
        document.getElementById("lrDisplay").textContent = this.value;
    });

    document.getElementById("hiddenNeurons").addEventListener("change", function () {
        hiddenNeurons = parseInt(this.value);
    });

    document.getElementById("activationFunction").addEventListener("change", function () {
        activationFunction = this.value;
    });

    document.getElementById("start-training").addEventListener("click", function () {
        createAndTrainModel();
    });

    function createAndTrainModel() {
        // Generate synthetic data
        const data = generateSyntheticData(200);
        const { xs, ys } = preprocessData(data);

        // Create a simple model
        model = tf.sequential();
        model.add(tf.layers.dense({ units: hiddenNeurons, activation: activationFunction, inputShape: [2] }));
        model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));

        // Compile model
        model.compile({
            optimizer: tf.train.adam(learningRate),
            loss: "binaryCrossentropy"
        });

        // Train model
        async function trainModel() {
            for (let i = 0; i < 50; i++) {
                await model.fit(xs, ys, { epochs: 1 });
                drawDecisionBoundary();
            }
        }

        trainModel();
    }

    function generateSyntheticData(numPoints) {
        let data = [];
        for (let i = 0; i < numPoints; i++) {
            let x = Math.random() * 2 - 1;
            let y = Math.random() * 2 - 1;
            let label = x * x + y * y < 0.5 ? 1 : 0;
            data.push({ x, y, label });
        }
        return data;
    }

    function preprocessData(data) {
        const xs = tf.tensor2d(data.map(d => [d.x, d.y]));
        const ys = tf.tensor2d(data.map(d => [d.label]));
        return { xs, ys };
    }

    function drawDecisionBoundary() {
        const resolution = 20;
        const imageData = ctx.createImageData(canvas.width, canvas.height);

        for (let i = 0; i < canvas.width; i += resolution) {
            for (let j = 0; j < canvas.height; j += resolution) {
                let x = (i / canvas.width) * 2 - 1;
                let y = (j / canvas.height) * 2 - 1;

                let prediction = model.predict(tf.tensor2d([[x, y]])).dataSync()[0];
                let color = prediction > 0.5 ? "rgba(255, 165, 0, 0.5)" : "rgba(30, 144, 255, 0.5)";

                ctx.fillStyle = color;
                ctx.fillRect(i, j, resolution, resolution);
            }
        }
    }
});
