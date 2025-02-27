document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("classificationCanvas");
    const ctx = canvas.getContext("2d");

    let model;
    let isTraining = false;
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

    document.getElementById("start-training").addEventListener("click", async function () {
        if (isTraining) return;
        if (trainingData.length < 10) {
            alert("Please add at least 10 training points by clicking on the canvas.");
            return;
        }
        isTraining = true;
        this.textContent = "Training...";
        await createAndTrainModel();
        this.textContent = "Start Training";
        isTraining = false;
    });

    document.getElementById("reset-data").addEventListener("click", function () {
        trainingData = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (model) model.dispose();
    });

    canvas.addEventListener("click", function (event) {
        if (isTraining) return;
        const rect = canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) / canvas.width * 2 - 1;
        const y = (event.clientY - rect.top) / canvas.height * 2 - 1;
        const label = event.shiftKey ? 1 : 0;

        trainingData.push({ x, y, label });
        drawPoint(x, y, label);
    });

    function drawPoint(x, y, label) {
        ctx.fillStyle = label === 1 ? "orange" : "blue";
        ctx.beginPath();
        ctx.arc((x + 1) * 200, (y + 1) * 200, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    async function createAndTrainModel() {
        if (model) model.dispose();

        const { xs, ys } = preprocessData(trainingData);
        
        model = tf.sequential();
        model.add(tf.layers.dense({ 
            units: hiddenNeurons, 
            activation: activationFunction, 
            inputShape: [2] 
        }));
        model.add(tf.layers.dense({ 
            units: 1, 
            activation: "sigmoid" 
        }));

        model.compile({
            optimizer: tf.train.adam(learningRate),
            loss: "binaryCrossentropy",
            metrics: ["accuracy"]
        });

        for (let epoch = 0; epoch < 50; epoch++) {
            const history = await model.fit(xs, ys, { 
                epochs: 1,
                batchSize: 32 
            });
            
            document.getElementById("loss").textContent = history.history.loss[0].toFixed(4);
            document.getElementById("accuracy").textContent = history.history.accuracy[0].toFixed(4);
            
            drawDecisionBoundary();
            await tf.nextFrame(); // Allow UI to update
        }

        xs.dispose();
        ys.dispose();
    }

    function preprocessData(data) {
        const xs = tf.tensor2d(data.map(d => [d.x, d.y]));
        const ys = tf.tensor2d(data.map(d => [d.label]));
        return { xs, ys };
    }

    function drawDecisionBoundary() {
        tf.tidy(() => {
            const resolution = 20;
            const grid = [];
            
            for (let i = 0; i < canvas.width; i += resolution) {
                for (let j = 0; j < canvas.height; j += resolution) {
                    const x = (i / canvas.width) * 2 - 1;
                    const y = (j / canvas.height) * 2 - 1;
                    grid.push([x, y]);
                }
            }

            const gridTensor = tf.tensor2d(grid);
            const predictions = model.predict(gridTensor).dataSync();

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let index = 0;

            for (let i = 0; i < canvas.width; i += resolution) {
                for (let j = 0; j < canvas.height; j += resolution) {
                    const prediction = predictions[index++];
                    ctx.fillStyle = prediction > 0.5 
                        ? "rgba(255, 165, 0, 0.2)" 
                        : "rgba(30, 144, 255, 0.2)";
                    ctx.fillRect(i, j, resolution, resolution);
                }
            }
        });

        trainingData.forEach(d => drawPoint(d.x, d.y, d.label));
    }
});