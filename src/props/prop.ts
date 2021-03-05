import {
  Audio,
  Mesh
} from "three";

abstract class Prop {
  public Mesh?: Mesh;
  public SoundDeployed?: Audio;
  public SoundMove?: Audio;
  public SoundDestroyed?: Audio;
}

export { Prop };
