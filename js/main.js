document.addEventListener("DOMContentLoaded", () => {
  // Element references
  const canvas = document.getElementById("sketchpad");
  const ctx = canvas.getContext("2d");
  const taskModeDiv = document.getElementById("taskMode");
  const freeModeDiv = document.getElementById("freeMode");
  const nextTaskSection = document.getElementById("nextTaskSection");
  const tabTask = document.getElementById("tab_task");
  const tabFree = document.getElementById("tab_free");
  const textResult = document.getElementById("text_result");
  const emojiResult = document.getElementById("emoji_result");

  // Default mode: Practice Mode ("free")
  let currentMode = "free";
  let drawing = false, lastX = 0, lastY = 0, model;
  let currentTask = null;
  let taskIndex = 0; // For sequential looping in Challenge Mode

  // Define tasks for Challenge Mode
  const tasks = [
    { prompt: "How many apples do you see?", images: ["🍎", "🍎", "🍎"], expected: 3 },
    { prompt: "How many bananas do you see?", images: ["🍌", "🍌"], expected: 2 },
    { prompt: "How many oranges do you see?", images: ["🍊", "🍊", "🍊", "🍊"], expected: 4 }
  ];

  // Request speech permission (silent utterance)
  function initSpeech() {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance("");
      speechSynthesis.speak(utterance);
    }
  }
  initSpeech();

  // Switch between Practice and Challenge modes
  function switchMode(mode) {
    currentMode = mode;
    if (mode === "task") {
      taskModeDiv.style.display = "block";
      nextTaskSection.style.display = "block";
      freeModeDiv.style.display = "none";
      tabTask.classList.add("active");
      tabFree.classList.remove("active");
      loadNextTask();
    } else {
      taskModeDiv.style.display = "none";
      nextTaskSection.style.display = "none";
      freeModeDiv.style.display = "block";
      tabFree.classList.add("active");
      tabTask.classList.remove("active");
      textResult.textContent = "";
      emojiResult.innerHTML = "";
    }
    clearCanvas();
  }

  // Set default mode to Practice Mode
  switchMode("free");

  // Tab event listeners
  tabFree.addEventListener("click", (e) => {
    e.preventDefault();
    switchMode("free");
  });
  tabTask.addEventListener("click", (e) => {
    e.preventDefault();
    switchMode("task");
  });

  // Load the next task sequentially for Challenge Mode
  function loadNextTask() {
    currentTask = tasks[taskIndex];
    taskIndex = (taskIndex + 1) % tasks.length;
    document.getElementById("task_prompt").textContent = currentTask.prompt;
    const taskImagesDiv = document.getElementById("task_images");
    taskImagesDiv.innerHTML = "";
    currentTask.images.forEach((img) => {
      const span = document.createElement("span");
      span.className = "fruit";
      span.textContent = img;
      taskImagesDiv.appendChild(span);
    });
    speak(currentTask.prompt);
  }

  // Resize canvas responsively and initialize background
  function resizeCanvas() {
    const size = Math.min(window.innerWidth * 0.8, 500);
    canvas.width = size;
    canvas.height = size;
    clearCanvas();
  }

  // Clear the canvas and reset result display
  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    emojiResult.innerHTML = "";
    document.getElementById("confidence_fill").style.width = "0%";
    textResult.textContent = "";
  }

  // Get pointer position (mouse or touch)
  function getPosition(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  // Draw a line on the canvas
  function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 15;
    ctx.lineJoin = ctx.lineCap = "round";
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
  }

  // Pointer event handlers for drawing
  function pointerDown(e) {
    drawing = true;
    const pos = getPosition(e);
    lastX = pos.x;
    lastY = pos.y;
    // Optional: vibrate for 50ms on mobile devices for tactile feedback.
    if (navigator.vibrate) navigator.vibrate(50);
    e.preventDefault();
  }
  function pointerMove(e) {
    if (!drawing) return;
    const pos = getPosition(e);
    drawLine(lastX, lastY, pos.x, pos.y);
    lastX = pos.x;
    lastY = pos.y;
    e.preventDefault();
  }
  function pointerUp(e) {
    drawing = false;
    e.preventDefault();
  }
  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("pointermove", pointerMove);
  canvas.addEventListener("pointerup", pointerUp);
  canvas.addEventListener("pointercancel", pointerUp);
  canvas.addEventListener("pointerleave", pointerUp);

  // Clear canvas button event
  document.getElementById("clear_button").addEventListener("click", clearCanvas);

  // Load TensorFlow model for digit recognition
  async function loadModel() {
    model = await tf.loadLayersModel("https://maneprajakta.github.io/Digit_Recognition_Web_App/models/model.json");
  }

  // Preprocess the canvas image for prediction
  function preprocessCanvas() {
    return tf.tidy(() => {
      // Convert canvas to grayscale (1 channel), resize using bilinear interpolation, normalize,
      // and apply a 5x5 max pooling to join strokes.
      const img = tf.browser.fromPixels(canvas, 1);
      const resized = tf.image.resizeBilinear(img, [28, 28]);
      const normalized = resized.toFloat().div(255.0);
      const pooled = tf.maxPool(normalized.expandDims(0), [5, 5], [1, 1], "same");
      return pooled;
    });
  }

  // Predict the digit drawn on the canvas
  async function predictDigit() {
    if (!model) {
      alert("Model is loading. Please wait!");
      return;
    }
    const tensor = preprocessCanvas();
    const predictions = await model.predict(tensor).data();
    const maxConfidence = Math.max(...predictions);
    const predictedDigit = predictions.indexOf(maxConfidence);
    displayResult(predictedDigit, maxConfidence);
  }

  // Display result and provide feedback
  function displayResult(digit, confidence) {
    const emojis = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
    if (currentMode === "task" && currentTask) {
      if (digit === currentTask.expected) {
        textResult.textContent = "Great job! That's correct.";
        speak("Great job! That's correct.");
      } else {
        textResult.textContent = "Oops, that's not correct. The correct answer is " + currentTask.expected + ".";
        speak("Oops, that's not correct. The correct answer is " + currentTask.expected + ".");
      }
    } else {
      emojiResult.innerHTML = emojis[digit];
      document.getElementById("confidence_fill").style.width = (confidence * 100) + "%";
      textResult.textContent = "You drew " + emojis[digit] + ".";
      speak("That's a " + digit);
    }
  }

  // Web Speech API: Speak the given text aloud
  function speak(text) {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  }

  // Speak prompt when Speak button is clicked (Challenge Mode only)
  document.getElementById("speak_prompt_button").addEventListener("click", () => {
    if (currentTask) {
      speak(currentTask.prompt);
    }
  });

  // Next task button event (Challenge Mode only)
  document.getElementById("next_task_button").addEventListener("click", () => {
    loadNextTask();
    clearCanvas();
  });

  // Predict button event
  document.getElementById("predict_button").addEventListener("click", predictDigit);

  // Initialize: resize canvas, load model, and set up listeners.
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  loadModel();
});