# Buscaminas

Buscaminas clásico en HTML, CSS y JavaScript puro. Sin dependencias, sin build:
se abre `index.html` en el navegador y ya.

## Jugar

- **Click** → abrir casilla
- **Click derecho** (o mantener pulsado en móvil) → poner/quitar bandera 🚩
- Tres niveles: fácil 9×9 (10 minas), medio 16×16 (40) y difícil 16×30 (99)
- Contador de minas restantes y cronómetro en la cabecera
- El primer click nunca explota: las minas se reparten después, esquivando esa casilla y sus vecinas

## Al perder

La pantalla se vuelve un desastre a propósito: parpadeo de colores, mensaje gigante
burlándose, emojis por todas partes, un gato riéndose y su audio.

El botón **JUGAR OTRA VEZ** se escapa a la esquina más lejana del cursor la primera vez
que intentas darle en cada partida, suelta un segundo mensaje burlándose de que fallaste
un botón enorme, triplica al gato y repite la risa tres veces. Al segundo intento ya
funciona.

Con `prefers-reduced-motion` activado el caos se mantiene pero el parpadeo baja de 0,1 s
a 1,2 s, por el riesgo de epilepsia fotosensible.

## Estructura

```
index.html
assets/
  css/styles.css
  js/game.js
  img/gato.png
  audio/risa.mp3
```

## Comprobación

Abre `index.html#test` y mira la consola: valida el cálculo de vecinos y de números
de las casillas. Debe imprimir `self-check OK`.
