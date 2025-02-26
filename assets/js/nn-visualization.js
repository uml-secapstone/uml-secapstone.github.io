document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("classificationCanvas");
    const ctx = canvas.getContext("2d");

    let model;
    let learningRate = 0.03;
    let hiddenNeurons = 5;
    let activationFunction = "relu";
    let trainingData = [];

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
        if (trainingData.length < 10) {
            alert("Please add at least 10 training points by clicking on the canvas.");
            return;
        }
        createAndTrainModel();
    });

    document.getElementById("reset-data").addEventListener("click", function () {
        trainingData = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    // Handle user clicks to add new training data
    canvas.addEventListener("click", function (event) {
        const rect = canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) / canvas.width * 2 - 1;
        const y = (event.clientY - rect.top) / canvas.height * 2 - 1;
        const label = event.shiftKey ? 1 : 0; // Shift+Click for one class, normal click for another

        trainingData.push({ x, y, label });
        drawPoint(x, y, label);
    });

    function drawPoint(x, y, label) {
        ctx.fillStyle = label === 1 ? "orange" : "blue";
        ctx.beginPath();
        ctx.arc((x + 1) * 200, (y + 1) * 200, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    function createAndTrainModel() {
        const { xs, ys } = preprocessData(trainingData);

        model = tf.sequential();
        model.add(tf.layers.dense({ units: hiddenNeurons, activation: activationFunction, inputShape: [2] }));
        model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));

        model.compile({
            optimizer: tf.train.adam(learningRate),
            loss: "binaryCrossentropy",
            metrics: ["accuracy"]
        });

        async function trainModel() {
            for (let i = 0; i < 50; i++) {
                const history = await model.fit(xs, ys, { epochs: 1 });

                const loss = history.history.loss[0].toFixed(4);
                const accuracy = (history.history.acc ? history.history.acc[0] : 0).toFixed(4);

                document.getElementById("loss").textContent = loss;
                document.getElementById("accuracy").textContent = accuracy;

                drawDecisionBoundary();
            }
        }

        trainModel();
    }

    function preprocessData(data) {
        const xs = tf.tensor2d(data.map(d => [d.x, d.y]));
        const ys = tf.tensor2d(data.map(d => [d.label]));
        return { xs, ys };
    }

    function drawDecisionBoundary() {
        const resolution = 20;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

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

        // Redraw user input points
        trainingData.forEach(d => drawPoint(d.x, d.y, d.label));
    }
});
