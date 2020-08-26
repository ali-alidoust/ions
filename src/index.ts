import './css/style.css';
import { Simulation } from './nbody';

const simulation = new Simulation();
simulation.init({
  // @ts-ignore
  numBodies: 32 * 32,
  numTrailPoints: 15,
});
simulation.startLoop();