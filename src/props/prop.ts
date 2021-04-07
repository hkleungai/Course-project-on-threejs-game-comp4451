import {
  Audio,
  Mesh
} from "three";

abstract class Prop {
  public MeshName?: string = "default";
  public SoundDeployed?: Audio;
  public SoundMove?: Audio;
  public SoundDestroyed?: Audio;
}

export { Prop };
