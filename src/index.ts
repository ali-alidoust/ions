import './css/style.css';
import { Simulation } from './nbody';

const simulation = new Simulation();
simulation.init({
  // @ts-ignore
  numBodies: 128 * 128,
  numTrailPoints: 15,
  dt: 0.0005,
  electricConstant: 0.00001,
  magneticConstant: 0.0000001,
  gravitationalConstant: 0.00001,
});
simulation.startLoop();