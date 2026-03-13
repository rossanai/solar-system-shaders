export const vs = `
  precision mediump float;
  precision mediump int;

  attribute vec4 position;
  attribute vec3 normal;

  uniform mat4 u_worldViewProjection;
  uniform mat4 u_worldInverseTranspose;
  uniform float u_time;
  uniform int u_type;

  varying vec3 v_normal;
  varying vec3 v_position;
  varying float v_noise;

  // --- Funciones de Ruido ---
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                   mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                   mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }

  void main() {
    vec3 pos = position.xyz;
    v_noise = 0.0;

    // AURA DEL SOL (Efecto de picos)
    if (u_type == 6) {
      float n = noise(pos * 4.0 + u_time * 0.4);
      v_noise = pow(n, 15.5); 
      pos += normal * (v_noise * 0.6);
    }

    gl_Position = u_worldViewProjection * vec4(pos, 1.0);
    v_normal = (u_worldInverseTranspose * vec4(normal, 0.0)).xyz;
    v_position = pos;
  }
`;

export const fs = `
  precision mediump float;
  precision mediump int;

  varying vec3 v_normal;
  varying vec3 v_position;
  varying float v_noise;

  uniform vec4 u_color;
  uniform float u_time;
  uniform int u_type; 

  // --- RUIDO FRACTAL ---
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                   mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                   mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 x) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 6; i++) {
      v += a * noise(x);
      x = x * 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 normal = normalize(v_normal);
    vec3 lightDir = normalize(vec3(0.5, 0.2, 1.0)); 
    float light = max(dot(normal, lightDir), 0.05);
    
    // Brillo especular
    vec3 viewDir = normalize(vec3(0,0,1));
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);

    // --- LÓGICA POR PLANETA ---

    if (u_type == 1) { // SOL
      float n = noise(v_position * 3.0 + u_time * 0.5);
      vec3 fire1 = vec3(1.0, 0.9, 0.1);
      vec3 fire2 = vec3(1.0, 0.4, 0.0);
      gl_FragColor = vec4(mix(fire1, fire2, n), 1.0);

    } else if (u_type == 6) { // AURA
      float glow = pow(1.1 - abs(dot(normal, vec3(0,0,1))), 3.0);
      vec3 auraColor = mix(vec3(1.0, 0.5, 0.1), vec3(1.0, 0.9, 0.6), v_noise);
      gl_FragColor = vec4(auraColor, (glow + v_noise * 0.5) * 0.6);

    } else if (u_type == 3) { // TIERRA
        float n = fbm(v_position * 4.5);
        float isWater = step(n, 0.52);
        vec3 waterColor = vec3(0.0, 0.25, 0.6) + (spec * 0.8 * isWater);
        vec3 landColor = vec3(0.1, 0.5, 0.2) * light;
        vec3 planetBase = mix(landColor, waterColor * light, isWater);
        
        float cloudNoise = fbm(v_position * 4.0 + vec3(u_time * 0.08, 0.0, 0.0));
        float clouds = smoothstep(0.45, 0.65, cloudNoise);
        vec3 finalColor = mix(planetBase, vec3(1.0), clouds * 0.9);
        
        float atm = pow(1.0 - dot(normal, vec3(0,0,1)), 3.0);
        gl_FragColor = vec4(finalColor + vec3(0.0, 0.4, 1.0) * atm * 0.4, 1.0);
        
    } else if (u_type == 2) { // VENUS
       float n = fbm(v_position * 3.5 + u_time * 0.05);
       vec3 c1 = vec3(0.95, 0.9, 0.7); 
       vec3 c2 = vec3(0.85, 0.5, 0.2); 
       gl_FragColor = vec4(mix(c1, c2, n) * light, 1.0);

    } else if (u_type == 4) { // JÚPITER / SATURNO
      float turb = noise(v_position * 6.0 + u_time * 0.1) * 0.4;
      float bands = sin((v_position.y + turb) * 18.0);
      vec3 col = mix(u_color.rgb, u_color.rgb * 0.4, bands * 0.5 + 0.5);
      gl_FragColor = vec4(col * light, 1.0);

    } else if (u_type == 7) { // MARTE (SOLO ROJO, SIN BLANCO)
       // 1. Superficie Rocosa
       float n = fbm(v_position * 8.0); 
       vec3 redDust = u_color.rgb;
       vec3 darkRock = vec3(0.35, 0.1, 0.05); // Manchas oscuras
       
       // Mezclamos solo polvo y roca
       vec3 surface = mix(redDust, darkRock, smoothstep(0.35, 0.75, n));
       
       // Eliminé la parte que calculaba los polos
       gl_FragColor = vec4(surface * light, 1.0);

    } else if (u_type == 8) { // MERCURIO / LUNA
       float n = noise(v_position * 20.0); 
       float craters = smoothstep(0.4, 0.55, n); 
       vec3 base = vec3(0.7, 0.7, 0.7);
       vec3 hole = vec3(0.4, 0.4, 0.4);
       gl_FragColor = vec4(mix(base, hole, craters) * light, 1.0);

    } else if (u_type == 9) { // URANO / NEPTUNO
       float cloudNoise = fbm(v_position * 3.0 + vec3(u_time * 0.15, 0.0, 0.0));
       vec3 baseColor = u_color.rgb;
       vec3 lighterGas = baseColor + vec3(0.2);
       float atmosphere = pow(1.0 - dot(normal, vec3(0,0,1)), 2.5);
       vec3 color = mix(baseColor, lighterGas, cloudNoise) * light;
       gl_FragColor = vec4(color + (atmosphere * vec3(0.5, 0.9, 1.0) * 0.5), 1.0);

    } else if (u_type == 5) { // ANILLO
      float dist = length(v_position.xz);
      float bands = sin(dist * 60.0) * 0.5 + 0.5;
      float dust = noise(v_position * 40.0); 
      gl_FragColor = vec4(u_color.rgb * bands * (0.8 + dust * 0.4), 0.9);

    } else { 
      gl_FragColor = vec4(u_color.rgb * light, u_color.a);
    }
  }
`;