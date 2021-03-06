import Webcam from './Webcam';
// @ts-ignore
import * as posenet from '@tensorflow-models/posenet';
import ExperienceState from './ExperienceState';

class Canvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private net: any;
  private state: HTMLDivElement;
  private timeout: WindowTimers;
  private OFFSET_MOVEMENT = 30;
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx = this.canvas.getContext('2d');
    this.state = document.querySelector('#state');
  }

  async init() {
    this.net = await posenet.load(1.0);
    await Webcam.init();
    await this.render();
  }

  async render() {
    requestAnimationFrame(() => this.render());
    const video = Webcam.getVideo();
    let pose = null;
    if (this.net) {
      pose = await this.net.estimateSinglePose(video, 0.5, true, 16);
      this.ctx.save();
      this.ctx.scale(-1, 1);
      this.ctx.translate(window.innerWidth * -1, 0);
      this.ctx.drawImage(video, 0, 0, window.innerWidth, (video.height / video.width) * window.innerWidth);
      this.ctx.restore();

      switch (ExperienceState.getInstance().getState()) {
        case ExperienceState.WAITING_FOR_USER:
          this.state.innerText = "En attente de l'utilisateur";
          if (pose) {
            const userKeypoints = pose.keypoints.filter((item: any) => {
              return item.score > 0.7;
            });
            if (userKeypoints.length > 5) {
              ExperienceState.getInstance().setState(ExperienceState.DRONE_IS_TAKING_OFF);
              this.state.innerText = 'Décollage du drone';
            }
          }
          break;
        case ExperienceState.DRONE_IS_TAKING_OFF:
          if (!this.timeout) {
            this.timeout = setTimeout(() => {
              ExperienceState.getInstance().setState(ExperienceState.WAITING_FOR_INTERACTION);
              this.state.innerText = "En attente d'interaction";
              this.timeout = null;
            }, 4000);
          }
          break;
        case ExperienceState.WAITING_FOR_INTERACTION:
          const buttonX = window.innerWidth - 130;
          const buttonY = 130;
          const radius = 50;
          const boundingOffset = 50;
          const boundingBox = {
            minX: buttonX - radius / 2 - boundingOffset,
            minY: buttonY - radius / 2 - boundingOffset,
            maxX: buttonX + radius / 2 + boundingOffset,
            maxY: buttonY + radius / 2 + boundingOffset,
          };

          this.ctx.fillStyle = 'red';
          this.ctx.arc(buttonX, buttonY, radius, 0, Math.PI * 2, true);
          this.ctx.fill();

          if (pose && this.checkPose(pose, boundingBox, { width: video.width, height: video.height })) {
            if (!this.timeout) {
              ExperienceState.getInstance().setState(ExperienceState.DRONE_IS_LANDING);
              this.state.innerText = 'Atterrissage du drone';
              this.timeout = setTimeout(() => {
                ExperienceState.getInstance().setState(ExperienceState.END_EXPERIENCE);
                this.state.innerText = "Fin de l'expérience";
              }, 4000);
            }
          }
          break;
      }
    }
  }

  checkPose(pose: any, boundingBox: any, videoSize: any): boolean {
    const keypoints = pose.keypoints;
    const rightWrist = this.getKeypoint(pose, 'rightWrist').position;
    /* const leftEye = this.getKeypoint(pose, 'leftEye');
    const rightShoulder = this.getKeypoint(pose, 'rightShoulder');
    return (
      leftEye.position.y > rightWrist.position.y + this.OFFSET_MOVEMENT &&
      rightShoulder.position.x + this.OFFSET_MOVEMENT < rightWrist.position.x
    ); */
    const positionOnCanvas = {
      x: (window.innerWidth / videoSize.width) * rightWrist.x,
      y: (window.innerHeight / videoSize.height) * rightWrist.y,
    };

    console.log(positionOnCanvas);
    console.log(boundingBox);
    return (
      positionOnCanvas.x >= boundingBox.minX &&
      positionOnCanvas.x <= boundingBox.maxX &&
      positionOnCanvas.y >= boundingBox.minY &&
      positionOnCanvas.y <= boundingBox.maxX
    );
  }

  getKeypoint(pose: any, keypoint: string) {
    return pose.keypoints.find((item: any) => {
      return item.part === keypoint;
    });
  }
}

export default Canvas;
