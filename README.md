# Druk DigiDraw  

**Reference Link:** [Live Demo](https://maneprajakta.github.io/Digit_Recognition_Web_App/)  

## App Structure  
**Keras → TensorFlow.js → (HTML + CSS + JavaScript) → GitHub Pages**  

## Introduction: A Step into AI-Powered Recognition  
Druk DigiDraw is a deep-learning-based handwritten digit recognition tool. It leverages a **Convolutional Neural Network (CNN)** trained on the **MNIST dataset** to recognize user-drawn numbers with high accuracy.  

## Aim  
To develop a CNN model that accurately identifies handwritten digits by training it on the **MNIST dataset** using Keras and TensorFlow.js.  

## MNIST Dataset Overview  
- **Training Set:** 60,000 images  
- **Testing Set:** 10,000 images  
- **Each Image:** 28×28 pixels, grayscale  

## CNN Model Overview  
- **17-layer architecture** with Conv2D, MaxPooling2D, BatchNormalization, Dense, Flatten, and Dropout layers.  
- **Input Layer:** 32 neurons | **Output Layer:** 10 neurons (one for each digit 0-9).  
- **Trained over 30 epochs** for optimal accuracy.  
- **Loss Function:** Categorical Cross-Entropy | **Optimizer:** Adam  
- **Achieved Accuracy:** **99.15%**  

## Deployment Process  
The trained model is converted to a **TensorFlow.js-compatible format**:  
1. **Save the model** as a `.json` file and weights as `.h5` using TensorFlow.js converters.  
2. **Load the model** in JavaScript using TensorFlow.js.  
3. **Deploy the app** using GitHub Pages for real-time digit recognition.  

This project is a **small step towards AI-driven education**, paving the way for Bhutanese students to explore AI-powered learning beyond just numbers!
