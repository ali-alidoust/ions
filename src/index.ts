import './css/style.css';
import {Simulation} from './nbody';

const simulation = new Simulation();
// @ts-ignore
simulation.setNumBodies(128*128);
simulation.startLoop();