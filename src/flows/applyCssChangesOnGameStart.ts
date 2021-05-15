const startMenu: HTMLElement = document.querySelector('.start-menu');
const avaliableActionMenu: HTMLElement = document.querySelector('.action-menu');
const hamburger: HTMLElement = document.querySelector(".hamburger");
const navigation: HTMLElement = document.querySelector(".navigation");
const showStatisticsDiv: HTMLElement = document.querySelector('.show-statistics');
const statisticsTableWithBanner: HTMLElement = document.querySelector('.statistics-table-with-banner');
const quitButtonForStatisticsTable: HTMLElement = statisticsTableWithBanner.querySelector('.cross');
const availableActions = document.querySelectorAll("[class*=available-action]");
const unavailableActions = document.querySelectorAll("[class*=unavailable-action]");

const showHideNagivationMenu = () => {
  if (hamburger.classList.contains('is-active')) {
    hamburger.classList.remove('is-active');
    navigation.style.display = 'none';
  } else {
    hamburger.classList.toggle("is-active");
    navigation.style.display = 'block';
  }
};

const applyCssChangesOnGameStart = (): void => {
  startMenu.style.display = 'none';

  avaliableActionMenu.style.display = 'block';

  hamburger.onclick = showHideNagivationMenu;

  if (showStatisticsDiv.classList.contains('available-action')) {
    showStatisticsDiv.onclick = () => {
      statisticsTableWithBanner.style.display = 'block';
      showHideNagivationMenu();
    };
  }
  quitButtonForStatisticsTable.onclick = () => {
    statisticsTableWithBanner.style.display = 'none';
  };
  availableActions.forEach((availableAction: HTMLElement) => {
    if (!availableAction.classList.contains('show-statistics')) {
      availableAction.onclick = () => {
        showHideNagivationMenu();
        const action = Array.from(availableAction.classList).find(name => name !== 'available-action');
        setTimeout(() => {
          // eslint-disable-next-line no-alert
          alert(`Please select an unit first for the ${action} action to work`);
        }, 50);
      };
    }
  });
  unavailableActions.forEach((unavailableAction: HTMLElement) => {
    unavailableAction.onclick = () => {
      showHideNagivationMenu();
      const action = Array.from(unavailableAction.classList).find(name => name !== 'unavailable-action');
      setTimeout(() => {
        // eslint-disable-next-line no-alert
        alert(`The ${action} action is not available`);
      }, 50);
    };
  });
};

