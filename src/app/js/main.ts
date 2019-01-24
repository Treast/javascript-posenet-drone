import App from './utils/App';
import Webcam from './core/Webcam';
import Canvas from './core/Canvas';

const app = new App();

app.isReady().then(() => {
  const canvasElement = document.getElementById('canvas') as HTMLCanvasElement;
  const canvas = new Canvas(canvasElement);

  canvas.init();
});
