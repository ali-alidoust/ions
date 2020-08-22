import './css/style.css';
import { Simulation } from './nbody';

const simulation = new Simulation();
simulation.init({
  // @ts-ignore
  numBodies: 128 * 128,
  numTrailPoints: 16,
});
simulation.startLoop();