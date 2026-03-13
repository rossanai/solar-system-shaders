Solar System with Shaders

Interactive 3D solar system visualization using WebGL shaders and JavaScript.
Description
This project implements a simple interactive solar system visualization using WebGL and GLSL shaders.
The scene renders spherical planets generated procedurally and applies custom shader programs for lighting and shading effects.
The system allows the user to explore the scene by moving the camera and observing the planets from different perspectives.
This project was developed as part of a Computer Graphics course, focusing on:
shader programming
3D rendering with WebGL
camera transformations
interactive visualization

Features
3D sphere generation using an icosphere mesh
Custom vertex and fragment shaders
Interactive camera controls
Real-time rendering in the browser
Simple solar system visualization

Controls
The camera can be controlled using the keyboard:
Q Move the camera upward
W Move the camera closer (zoom in)
S Move the camera away (zoom out)
E Change the viewing angle
These controls allow the user to explore the scene from multiple perspectives.

Project Structure

solar-system-shaders
│
├── js
│   ├── main.js        # Main WebGL logic and scene initialization
│   ├── shaders.js     # Shader programs used for rendering
│   └── icosphere.js   # Sphere mesh generation (planet geometry)
│
└── shaders
    └── index.html     # Entry point that loads the WebGL application


Technologies
JavaScript
WebGL
GLSL Shaders
HTML5

How to Run
Clone the repository:

git clone https://github.com/rossanai/solar-system-shaders.git

Open the project folder.
Run the project by opening:

shaders/index.html

in a browser that supports WebGL (Chrome, Firefox, Edge).

Learning Goals
This project explores several fundamental topics in computer graphics:
3D geometry generation
shader programming
real-time rendering
camera movement and transformations
interactive visualization in WebGL

Author
Rossana Ilardo
Computer Engineering – Universidad Simón Bolívar
