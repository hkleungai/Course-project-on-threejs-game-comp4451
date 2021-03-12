import dat from 'dat.gui';
import initDat from 'three-dat.gui';

// This might help for further dat.gui + threejs development
initDat(dat);

interface GUIParams extends dat.GUIParams {
  onClose?: () => void;
}

class GUI extends dat.GUI {
  static readonly datGUI = dat.GUI;

  constructor(option?: GUIParams) {
    super(option);

    // Set the GUI to be invisible initially
    this.hide();
  }

  addFolder(
    propName: string,
    disabled = false, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): dat.GUI {
    // Getting folders from parents' execution, for later possible extensions
    const folder = super.addFolder(propName);
    return folder;
  }

  showGUI(callback?: () => void): void {
    // dat.GUI way of "show" following a "hide"
    this.show();
    this.closed = false;

    callback?.();
  }

  listenOnClose(callback?: () => void): void {
    const guiCloseDiv: HTMLElement = this.domElement.querySelector('div.close-button');
    guiCloseDiv.onclick = () => {
      this.hide();
      callback?.();
    };
  }
}
export {
  GUI,
  GUIParams,
};
