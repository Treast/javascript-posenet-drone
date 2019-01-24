export default class ExperienceState {
  //  State
  static WAITING_FOR_USER = 'WAITING_FOR_USER';
  static DRONE_IS_TAKING_OFF = 'DRONE_IS_TAKING_OFF';
  static WAITING_FOR_INTERACTION = 'WAITING_FOR_INTERACTION';
  static DRONE_IS_LANDING = 'DRONE_IS_LANDING';
  static END_EXPERIENCE = 'END_EXPERIENCE';
  // Property
  private state: string;
  private static instance: ExperienceState;

  private constructor() {
    this.state = ExperienceState.WAITING_FOR_USER;
  }

  static getInstance() {
    if (!ExperienceState.instance) {
      ExperienceState.instance = new ExperienceState();
    }
    return ExperienceState.instance;
  }

  getState() {
    return this.state;
  }

  setState(state: string) {
    this.state = state;
  }
}
