import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';


import { ICommandPalette, } from '@jupyterlab/apputils';

import { ILauncher } from '@jupyterlab/launcher';

import { NotebookActions, INotebookTracker } from '@jupyterlab/notebook';

import { IMainMenu } from '@jupyterlab/mainmenu';

import { Menu } from '@lumino/widgets';

import { Cell } from '@jupyterlab/cells'


/**
 * The command IDs used by the console plugin.
 */
namespace CommandIDs {
  export const indent = 'cell-borders:indent';
  export const unindent = 'cell-borders:unindent';
}

/**
 * Initialization data for the extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'signals',
  autoStart: true,
  optional: [ILauncher],
  requires: [ICommandPalette, IMainMenu, INotebookTracker],
  activate: activate
};

/**
 * Activate the JupyterLab extension.
 *
 * @param app Jupyter Font End
 * @param palette Jupyter Commands Palette
 * @param mainMenu Jupyter Menu
 * 
 */
function activate(
  app: JupyterFrontEnd,
  palette: ICommandPalette,
  mainMenu: IMainMenu,
  nbTracker: INotebookTracker,
): void {
  const { commands } = app;
  const category = 'Extension Examples';
  function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  nbTracker.widgetAdded.connect((_, args) => {
    sleep(1000).then(() => {
      args.content.widgets.forEach(function (cell) {
        const indent = getIndent(cell);
        const elem = cell.node;
        elem.setAttribute("style", `margin: 0px 0px 0px ${indent}px`);
      });
    });

  });

  function getIndent(cell: Cell) {
    const data = cell.model.metadata;
    let indent = data.get("indent");
    if (!indent) {
      indent = "0";
    }
    indent = indent.toString();
    return indent;
  }

  function setIndent(indent: string, cell: Cell) {
    cell.model.metadata.set("indent", indent);
  }






  function changeIndentation(diff: number): void {
    const cell = nbTracker.activeCell;
    let indent = getIndent(cell);
    indent = (parseInt(indent) + diff).toString();
    setIndent(indent, cell);
    cell.node.setAttribute('style', `margin: 0px 0px 0px ${indent}px;`)
  }




  NotebookActions.executed.connect((_, args) => {
    const { cell } = args;
    const indent = getIndent(cell);
    const currentElement = nbTracker.activeCell.node;
    currentElement.setAttribute('style', `margin: 0px 0px 0px ${indent}px`);
  })
  // Add menu tab
  const signalMenu = new Menu({ commands });
  signalMenu.title.label = 'Change Indentation';
  mainMenu.addMenu(signalMenu);



  //Auto-Indent on new cell creation.
  // Add commands to registry
  commands.addCommand(CommandIDs.indent, {
    label: 'Indent',
    caption: 'Indent',
    execute: () => changeIndentation(20)

  });

  palette.addItem({ command: CommandIDs.indent, category });
  signalMenu.addItem({ command: CommandIDs.indent });

  commands.addCommand(CommandIDs.unindent, {
    label: 'Unindent',
    caption: 'Unindent',
    execute: (): void => changeIndentation(-20)
  });

  palette.addItem({ command: CommandIDs.unindent, category });
  signalMenu.addItem({ command: CommandIDs.unindent });


  app.commands.addKeyBinding({
    command: CommandIDs.indent,
    args: {},
    keys: ['Shift ArrowRight'],
    selector: '.jp-Cell'
  });

  app.commands.addKeyBinding({
    command: CommandIDs.unindent,
    args: {},
    keys: ['Shift ArrowLeft'],
    selector: '.jp-Cell'
  });
  // commands.processKeydownEvent()

}



export default extension;