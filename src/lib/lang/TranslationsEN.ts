export default {
  en: {
    Top: {
      title: '',
      siteSetting: 'Site setting',
    },
    Common: {
      実行: 'OK',
      戻る: 'Cancel',
      作成: 'Create',
    },
    Setting: {
      language: 'language',
      colorTheme: {
        title: 'Site Color Themes',
        normal: 'light',
        sky: 'sky',
        pink: 'pink',
        green: 'green',
        dark: 'dark',
        deepSea: 'abyss',
      },
      equipmentUISetting: {
        title: 'Equipment display UI adjustment',
        border: 'border',
        bold: 'bold',
        radius: 'circle',
        sample: 'sample',
      },
      closeTabSetting: 'Settings for closing unsaved saved data tabs',
      closeTabConfig: 'Display confirmation dialog',
      equipmentDetailsVisible: 'Display of detailed equipment information',
      invisibleDetails: 'Do not show detailed information',
      simulationCount: {
        title: 'Number of simulations',
        description1: 'Larger values increase the accuracy of the calculation, but decrease performance during the calculation.',
        description2: '',
        unit: 'times',
      },
      defaultProficiency: {
        title: 'Default proficiency when selecting equipment',
        batch: 'batch setting',
      },
      deckBuilderReadingSetting: 'Deck Builder format data loading settings',
      loadAllFleet: 'Always load all fleet data',
      saveDataBackUp: {
        title: 'Backup of saved data',
        restore: 'restore',
        description1: 'Create a backup file of saved data',
        description2: 'Select the backup file',
      },
    },
    Home: {
      title: 'Simulator',
      description1: 'Main features.',
      description2: 'By organizing LBAS, fleets, and enemy fleets, it is possible to simulate the air status, aircraft losses, and shot down rate for all battles, including those on the road.',
    },
    Manager: {
      title: 'Ship / Equipment',
      description1: 'Sub features.',
      description2: 'When you register your in-game ship and equipment information, it will be reflected in the ship and equipment you can select in the simulator, so you don\'t have to worry about "I have that equipment...? You don\'t have to worry about "I had that equipment..." anymore.',
    },
    OtherData: {
      title: 'Someone Data',
      description1: 'You can browse save data uploaded by others.',
    },
    DataImport: {
      title: 'Data transfer',
      oldVersion: '旧制空権シミュレータ',
      description1: 'The save data, equipment, and ships information that have been created and registered up to this point will be transferred.',
      importSaveData: 'Transfer(save data)',
      importShipAndItem: 'Transfer(equipment / ship)',
      confirm1: {
        description1: 'Create a folder to store the transferred data.',
        description2: 'Specify a folder name and press OK to start the transfer.',
      },
      confirm2: {
        description1: 'Equipment / ship information is already registered on this site.',
        description2: 'These data will be overwritten when the transfer is performed. ',
        description3: 'Are you sure you want to do the transfer?',
      },
    },
    Linkage: {
      title: 'Site linkage',
      description1: 'You can load the deck builder format by embedding it in the URL with ?predeck=... in the URL to load the fleets data.',
    },
    Warning: {
      message1: '',
      message2: 'I am not responsible for any profits, damages or any other events resulting from the information or calculations on this site.',
    },
  },
};
