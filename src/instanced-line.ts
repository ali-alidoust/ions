import { Line, BufferGeometry, Material, BufferAttribute } from "three";

export class InstancedLine<
  TGeometry extends BufferGeometry = BufferGeometry,
  TMaterial extends Material | Material[] = Material | Material[]
  > extends Line<TGeometry, TMaterial> {

  count?: number;
  isInstancedMesh?: boolean;
  instanceColor: null;
  instanceMatrix: BufferAttribute;

  constructor(
    geometry?: TGeometry,
    material?: TMaterial,
    count?: number,
  ) {
    super(geometry, material);
    this.instanceMatrix = new BufferAttribute( new Float32Array( count * 16 ), 16 );
    this.count = count;
    this.isInstancedMesh = true;
    this.instanceColor = null;
  }

}