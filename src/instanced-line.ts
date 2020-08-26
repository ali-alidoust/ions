import { Line, TextGeometry, Geometry, BufferGeometry, Material, BufferAttribute } from "three";

export class InstancedLine<
  TGeometry extends Geometry | BufferGeometry = Geometry | BufferGeometry,
  TMaterial extends Material | Material[] = Material | Material[]
  > extends Line<TGeometry, TMaterial> {

  count?: number;
  isInstancedMesh?: boolean;
  instanceMatrix: BufferAttribute;

  constructor(
    geometry?: TGeometry,
    material?: TMaterial,
    count?: number,
    mode?: number,
  ) {
    super(geometry, material, mode);
    this.instanceMatrix = new BufferAttribute( new Float32Array( count * 16 ), 16 );
    this.count = count;
    this.isInstancedMesh = true;
  }

}