document.getElementById("imageForm").onsubmit = async function (e) {
    e.preventDefault();
    let formData = new FormData();
    let fileInput = document.getElementById("imgUpload");
    formData.append("file", fileInput.files[0]);

    let response = await fetch("https://your-flask-app.onrender.com/predict", {
        method: "POST",
        body: formData
    });

    let result = await response.json();
    document.querySelector(".output").innerHTML = 
        `Prediction: ${result.prediction}, Confidence: ${result.confidence}`;
};
