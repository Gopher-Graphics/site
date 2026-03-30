import avatar1 from "../assets/avatars/1.jpeg";
import avatar2 from "../assets/avatars/2.jpeg";
import avatar3 from "../assets/avatars/3.jpeg";
import avatar4 from "../assets/avatars/4.jpeg";
import avatar5 from "../assets/avatars/5.jpeg";
import avatar6 from "../assets/avatars/6.jpeg";
import avatar7 from "../assets/avatars/7.jpeg";
import avatar8 from "../assets/avatars/8.jpeg";

export const FAKE_USERS = [
  { x500: "mchen", password: "password", name: "Mia Chen", role: "President", avatar: avatar1 },
  { x500: "jonask", password: "password", name: "Jonas K.", role: "Vice President", avatar: avatar2 },
  { x500: "priya", password: "password", name: "Priya S.", role: "Projects Lead", avatar: avatar3 },
  { x500: "liamd", password: "password", name: "Liam D.", role: "Webmaster", avatar: avatar4 },
  { x500: "sarav", password: "password", name: "Sara V.", role: "Events", avatar: avatar5 },
  { x500: "devm", password: "password", name: "Dev M.", role: "Member", avatar: avatar6 },
  { x500: "demo", password: "demo", name: "Demo User", role: "Member", avatar: avatar7 },
];

export const CHANNELS = [
  { id: "general",    name: "general",         desc: "General club chat" },
  { id: "shaders",    name: "shaders",         desc: "GLSL tips and shader showcases" },
  { id: "opengl",     name: "opengl-vulkan",   desc: "Low-level graphics APIs" },
  { id: "resources",  name: "resources",       desc: "Papers, tutorials, and links" },
  { id: "events",     name: "events",          desc: "Upcoming meetings and hackathons" },
  { id: "random",     name: "random",          desc: "Off-topic fun" },
];

export const SEED_MESSAGES = {
  general: [
    { id:1, author:"Mia Chen",  text:"Hey everyone! Reminder that this Thursday's meeting we're doing a live WebGL demo session. Bring your shaders!",         time:"Today 10:02 AM" },
    { id:2, author:"Jonas K.",  text:"Can't wait. I've been working on a Navier-Stokes sim I want to show off",                                            time:"Today 10:14 AM" },
    { id:3, author:"Priya S.",  text:"Nice! I'll be there. Also, the project submissions for the spring showcase are open — upload yours to the projects page.", time:"Today 10:31 AM" },
    { id:4, author:"Dev M.",    text:"Quick question — are we doing the ray tracing workshop before or after the IK animation one?",                          time:"Today 11:05 AM" },
    { id:5, author:"Mia Chen",  text:"Ray tracing first, April 10th. IK animation will be April 24th.",                                                       time:"Today 11:08 AM" },
  ],
  shaders: [
    { id:1, author:"Sara V.",  text:"Just found this amazing breakdown of the SDF union operator with smooth blending. Game changer for sculpting shapes in code.", time:"Yesterday 4:20 PM" },
    { id:2, author:"Jonas K.", text:"Inigo Quilez's articles are the bible for this stuff. Have you seen his domain repetition trick?",                          time:"Yesterday 4:45 PM" },
    { id:3, author:"Liam D.",  text:"I ported one of his scenes to WebGPU and the performance difference is wild. Compute shaders >>> fragment shaders for this.", time:"Yesterday 5:10 PM" },
  ],
  opengl: [
    { id:1, author:"Liam D.",  text:"Does anyone have a clean Vulkan swapchain recreation example? Mine crashes on resize and I can't figure out why.",       time:"Monday 2:00 PM" },
    { id:2, author:"Priya S.", text:"The vkDeviceWaitIdle call before cleanup is key. Also make sure you're rebuilding the pipeline if the extent changed.",    time:"Monday 2:18 PM" },
    { id:3, author:"Liam D.",  text:"Oh my god that was it. The extent rebuild. Thank you Priya you legend",                                               time:"Monday 2:25 PM" },
  ],
  resources: [
    { id:1, author:"Mia Chen",  text:"Pinning this: 'Physically Based Rendering' (PBRT) 4th edition is now free online at pbr-book.org. Required reading.", time:"Mar 18 9:00 AM" },
    { id:2, author:"Sara V.",   text:"Also 'Real-Time Rendering' 4th ed is phenomenal for rasterization pipelines.",                                          time:"Mar 18 9:30 AM" },
    { id:3, author:"Dev M.",    text:"LearnOpenGL.com is still the best practical tutorial site. Goes from zero to deferred shading.",                         time:"Mar 19 1:00 PM" },
  ],
  events: [
    { id:1, author:"Sara V.",  text:"Spring Showcase — April 30th, 6 PM, Keller Hall Atrium. Submit your projects before April 25!",  time:"Mar 20 11:00 AM" },
    { id:2, author:"Mia Chen", text:"Also — we have a team entering the SIGGRAPH student research competition. DM me if you want in!",   time:"Mar 20 11:15 AM" },
  ],
  random: [
    { id:1, author:"Jonas K.", text:"Hot take: a beautifully optimized fragment shader is more satisfying than any high-level engine abstraction.",  time:"Mar 21 3:00 PM" },
    { id:2, author:"Dev M.",   text:"Controversial but I agree. There's something meditative about watching a 2ms draw call you wrote from scratch.",  time:"Mar 21 3:12 PM" },
    { id:3, author:"Priya S.", text:"Y'all need help (I also agree)",                                                                              time:"Mar 21 3:15 PM" },
  ],
};

export const PROJECTS = [
  { id:1, title:"Ray Tracer in C++", author:"Mia Chen", tags:["C++","Ray Tracing"], desc:"A full path-tracer with global illumination and material shaders.", date:"Mar 2026", longDesc:"This project implements a fully featured offline path tracer from scratch in C++17. It supports physically-based BRDFs including Lambertian diffuse, GGX microfacet specular, and dielectric transmission. The renderer uses Monte Carlo integration with importance sampling and a BVH acceleration structure for fast ray-triangle intersection. Final renders on a 1080p scene with 2048 samples-per-pixel take around 40 minutes on a modern CPU.", tech:["C++17","BVH Acceleration","Monte Carlo","BRDF","Multi-threading"], github:"github.com/miachen/raytracer", preview:["Global illumination with soft shadows","Caustics through glass spheres","Subsurface scattering on wax candles"] },
  { id:2, title:"WebGL Fluid Sim", author:"Jonas K.", tags:["WebGL","Simulation"], desc:"Real-time Navier-Stokes fluid dynamics running on the GPU.", date:"Feb 2026", longDesc:"A GPU-accelerated 2D fluid simulation running entirely in the browser using WebGL2 fragment shaders. The solver implements the stable fluids method with velocity advection, pressure projection via Jacobi iteration, and vorticity confinement.", tech:["WebGL2","GLSL","Navier-Stokes","Jacobi Solver","JavaScript"], github:"github.com/jonask/webgl-fluid", preview:["Real-time dye injection and mixing","Vortex shedding visualization","Pressure field heatmap overlay"] },
  { id:3, title:"Voxel Engine", author:"Priya S.", tags:["OpenGL","Voxel"], desc:"Minecraft-inspired voxel renderer with ambient occlusion.", date:"Jan 2026", longDesc:"A chunk-based voxel world renderer built with OpenGL 4.5 and written in Rust. Features greedy mesh generation, pre-computed ambient occlusion, frustum culling, and a custom texture atlas system.", tech:["OpenGL 4.5","Rust","Greedy Meshing","Ambient Occlusion","Perlin Noise"], github:"github.com/priyaS/voxel-rs", preview:["Chunk streaming with LOD","Underground cave networks","Dynamic day/night sky rendering"] },
  { id:4, title:"Procedural Terrain", author:"Liam D.", tags:["GLSL","Procedural"], desc:"Infinite terrain generation using layered Perlin noise.", date:"Dec 2025", longDesc:"An infinite procedural terrain system implemented entirely in GLSL compute shaders. Terrain height is generated from 8 octaves of domain-warped Perlin noise, producing realistic mountain ranges, valleys, and coastlines.", tech:["GLSL Compute","Domain Warping","Hydraulic Erosion","Geometry Clipmaps","C++"], github:"github.com/liamd/procterrain", preview:["Domain-warped mountain formations","Hydraulic erosion river valleys","Seamless LOD transitions at 4K"] },
  { id:5, title:"GLSL Shader Gallery", author:"Sara V.", tags:["GLSL","Art"], desc:"A collection of fragment shaders exploring color and form.", date:"Nov 2025", longDesc:"A curated interactive gallery of 12 real-time fragment shaders. The collection spans SDF raymarching, reaction-diffusion systems, Truchet tiling, and animated Fourier series visualizations.", tech:["GLSL","SDF Raymarching","Reaction-Diffusion","Shadertoy","WebGL"], github:"github.com/sarav/shader-gallery", preview:["SDF raymarched abstract sculptures","Gray-Scott reaction-diffusion patterns","Animated Fourier epicycles"] },
  { id:6, title:"Skeletal Animation", author:"Dev M.", tags:["OpenGL","Animation"], desc:"Skinned mesh animation with inverse kinematics solver.", date:"Oct 2025", longDesc:"A skeletal animation system supporting the glTF 2.0 format with GPU skinning, blend tree interpolation between animation clips, and a FABRIK-based IK solver for foot placement on uneven terrain.", tech:["OpenGL","glTF 2.0","GPU Skinning","FABRIK IK","Dear ImGui"], github:"github.com/devm/skeletal-anim", preview:["Blend tree animation transitions","FABRIK foot IK on sloped terrain","Real-time bone weight visualization"] },
];
